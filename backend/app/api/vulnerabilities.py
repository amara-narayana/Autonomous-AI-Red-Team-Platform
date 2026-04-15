from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.models.models import Vulnerability, Target, get_db
from app.schemas.schemas import VulnerabilityCreate, VulnerabilityResponse, VulnerabilityUpdate
from app.api.auth import get_current_user
from app.models.models import User

router = APIRouter()


@router.get("/", response_model=List[VulnerabilityResponse])
def list_vulnerabilities(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    vulnerabilities = db.query(Vulnerability).offset(skip).limit(limit).all()
    return vulnerabilities


@router.post("/", response_model=VulnerabilityResponse)
def create_vulnerability(vuln: VulnerabilityCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Verify target exists
    target = db.query(Target).filter(Target.id == vuln.target_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="Target not found")
    
    db_vuln = Vulnerability(**vuln.model_dump())
    db.add(db_vuln)
    db.commit()
    db.refresh(db_vuln)
    return db_vuln


@router.get("/{vuln_id}", response_model=VulnerabilityResponse)
def get_vulnerability(vuln_id: int, db: Session = Depends(get_db)):
    vuln = db.query(Vulnerability).filter(Vulnerability.id == vuln_id).first()
    if not vuln:
        raise HTTPException(status_code=404, detail="Vulnerability not found")
    return vuln


@router.put("/{vuln_id}", response_model=VulnerabilityResponse)
def update_vulnerability(vuln_id: int, vuln_update: VulnerabilityUpdate, db: Session = Depends(get_db)):
    vuln = db.query(Vulnerability).filter(Vulnerability.id == vuln_id).first()
    if not vuln:
        raise HTTPException(status_code=404, detail="Vulnerability not found")
    
    for key, value in vuln_update.model_dump(exclude_unset=True).items():
        setattr(vuln, key, value)
    
    db.commit()
    db.refresh(vuln)
    return vuln


@router.delete("/{vuln_id}")
def delete_vulnerability(vuln_id: int, db: Session = Depends(get_db)):
    vuln = db.query(Vulnerability).filter(Vulnerability.id == vuln_id).first()
    if not vuln:
        raise HTTPException(status_code=404, detail="Vulnerability not found")
    
    db.delete(vuln)
    db.commit()
    return {"message": "Vulnerability deleted successfully"}
