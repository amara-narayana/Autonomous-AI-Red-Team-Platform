from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.models.models import Target, get_db
from app.schemas.schemas import TargetCreate, TargetResponse, TargetUpdate
from app.api.auth import get_current_user
from app.models.models import User

router = APIRouter()


@router.get("/", response_model=List[TargetResponse])
def list_targets(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    targets = db.query(Target).offset(skip).limit(limit).all()
    return targets


@router.post("/", response_model=TargetResponse)
def create_target(target: TargetCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_target = Target(**target.model_dump(), owner_id=current_user.id)
    db.add(db_target)
    db.commit()
    db.refresh(db_target)
    return db_target


@router.get("/{target_id}", response_model=TargetResponse)
def get_target(target_id: int, db: Session = Depends(get_db)):
    target = db.query(Target).filter(Target.id == target_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="Target not found")
    return target


@router.put("/{target_id}", response_model=TargetResponse)
def update_target(target_id: int, target_update: TargetUpdate, db: Session = Depends(get_db)):
    target = db.query(Target).filter(Target.id == target_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="Target not found")
    
    for key, value in target_update.model_dump(exclude_unset=True).items():
        setattr(target, key, value)
    
    db.commit()
    db.refresh(target)
    return target


@router.delete("/{target_id}")
def delete_target(target_id: int, db: Session = Depends(get_db)):
    target = db.query(Target).filter(Target.id == target_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="Target not found")
    
    db.delete(target)
    db.commit()
    return {"message": "Target deleted successfully"}
