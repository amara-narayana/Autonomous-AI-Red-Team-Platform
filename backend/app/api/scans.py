from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.models.models import Scan, Target, get_db
from app.schemas.schemas import ScanCreate, ScanResponse, ScanUpdate
from app.api.auth import get_current_user
from app.models.models import User

router = APIRouter()


@router.get("/", response_model=List[ScanResponse])
def list_scans(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    scans = db.query(Scan).offset(skip).limit(limit).all()
    return scans


@router.post("/", response_model=ScanResponse)
def create_scan(scan: ScanCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Verify target exists
    target = db.query(Target).filter(Target.id == scan.target_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="Target not found")
    
    db_scan = Scan(**scan.model_dump(), status="pending", owner_id=current_user.id)
    db.add(db_scan)
    db.commit()
    db.refresh(db_scan)
    
    # Trigger Celery task to run the scan (simplified)
    from app.tasks.scanner_tasks import run_nmap_scan, run_nikto_scan
    
    if scan.scan_type == "nmap":
        run_nmap_scan.delay(scan.id, target.url)
    elif scan.scan_type == "nikto":
        run_nikto_scan.delay(scan.id, target.url)
    # Add more scan types as needed
    
    return db_scan


@router.get("/{scan_id}", response_model=ScanResponse)
def get_scan(scan_id: int, db: Session = Depends(get_db)):
    scan = db.query(Scan).filter(Scan.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    return scan


@router.put("/{scan_id}", response_model=ScanResponse)
def update_scan(scan_id: int, scan_update: ScanUpdate, db: Session = Depends(get_db)):
    scan = db.query(Scan).filter(Scan.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    
    for key, value in scan_update.model_dump(exclude_unset=True).items():
        setattr(scan, key, value)
    
    db.commit()
    db.refresh(scan)
    return scan


@router.delete("/{scan_id}")
def delete_scan(scan_id: int, db: Session = Depends(get_db)):
    scan = db.query(Scan).filter(Scan.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    
    db.delete(scan)
    db.commit()
    return {"message": "Scan deleted successfully"}
