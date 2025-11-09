from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import User, Certificate
from app.schemas import Certificate as CertificateSchema
from app.auth import get_current_active_user

router = APIRouter(prefix="/api/certificates", tags=["certificates"])


@router.get("/", response_model=List[CertificateSchema])
def get_my_certificates(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all user's certificates"""
    certificates = db.query(Certificate).filter(
        Certificate.user_id == current_user.id
    ).all()
    
    return certificates


@router.get("/{certificate_id}", response_model=CertificateSchema)
def get_certificate(
    certificate_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get specific certificate by ID"""
    certificate = db.query(Certificate).filter(
        Certificate.certificate_id == certificate_id,
        Certificate.user_id == current_user.id
    ).first()
    
    if not certificate:
        raise HTTPException(
            status_code=404,
            detail="Certificate not found"
        )
    
    return certificate


@router.get("/{certificate_id}/download")
def download_certificate(
    certificate_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Download certificate PDF"""
    certificate = db.query(Certificate).filter(
        Certificate.certificate_id == certificate_id,
        Certificate.user_id == current_user.id
    ).first()
    
    if not certificate:
        raise HTTPException(
            status_code=404,
            detail="Certificate not found"
        )
    
    # For now, return the URL. In production, this would generate and serve the PDF
    return {
        "certificate_id": certificate.certificate_id,
        "download_url": certificate.pdf_url,
        "message": "Certificate PDF will be generated and served here"
    }
