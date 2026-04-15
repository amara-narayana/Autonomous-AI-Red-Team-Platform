from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


# User schemas
class UserBase(BaseModel):
    email: EmailStr
    username: str


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    password: Optional[str] = None


class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# Target schemas
class TargetBase(BaseModel):
    name: str
    url: str
    description: Optional[str] = None


class TargetCreate(TargetBase):
    pass


class TargetUpdate(BaseModel):
    name: Optional[str] = None
    url: Optional[str] = None
    description: Optional[str] = None


class TargetResponse(TargetBase):
    id: int
    owner_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Scan schemas
class ScanBase(BaseModel):
    name: str
    scan_type: str


class ScanCreate(ScanBase):
    target_id: int


class ScanUpdate(BaseModel):
    status: Optional[str] = None
    results: Optional[str] = None


class ScanResponse(ScanBase):
    id: int
    status: str
    target_id: int
    owner_id: int
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True


# Vulnerability schemas
class VulnerabilityBase(BaseModel):
    title: str
    description: str
    severity: str
    cvss_score: Optional[float] = None
    cwe_id: Optional[str] = None
    evidence: Optional[str] = None
    remediation: Optional[str] = None


class VulnerabilityCreate(VulnerabilityBase):
    target_id: int
    scan_id: Optional[int] = None


class VulnerabilityUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    severity: Optional[str] = None
    cvss_score: Optional[float] = None
    is_false_positive: Optional[bool] = None
    remediation: Optional[str] = None


class VulnerabilityResponse(VulnerabilityBase):
    id: int
    target_id: int
    scan_id: Optional[int] = None
    is_false_positive: bool
    created_at: datetime

    class Config:
        from_attributes = True


# Token schemas
class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: Optional[str] = None
