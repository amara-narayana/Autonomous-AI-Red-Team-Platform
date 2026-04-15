import subprocess
import json
from datetime import datetime
from celery import shared_task
from sqlalchemy.orm import Session

from app.tasks.celery_app import celery_app
from app.models.models import Scan, Vulnerability, get_db


@celery_app.task(bind=True)
def run_nmap_scan(self, scan_id: int, target_url: str):
    """Run nmap port scan on target"""
    db = next(get_db())
    
    try:
        scan = db.query(Scan).filter(Scan.id == scan_id).first()
        if not scan:
            return {"error": "Scan not found"}
        
        # Update scan status
        scan.status = "running"
        scan.started_at = datetime.utcnow()
        db.commit()
        
        # Extract host from URL
        host = target_url.replace("http://", "").replace("https://", "").split("/")[0]
        
        # Run nmap command
        cmd = ["nmap", "-sV", "-oX", "-", host]
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
        
        # Parse results (simplified)
        scan.results = result.stdout
        scan.status = "completed"
        scan.completed_at = datetime.utcnow()
        db.commit()
        
        return {"status": "completed", "scan_id": scan_id}
    
    except Exception as e:
        scan.status = "failed"
        scan.results = str(e)
        db.commit()
        return {"error": str(e)}
    
    finally:
        db.close()


@celery_app.task(bind=True)
def run_nikto_scan(self, scan_id: int, target_url: str):
    """Run Nikto web vulnerability scan on target"""
    db = next(get_db())
    
    try:
        scan = db.query(Scan).filter(Scan.id == scan_id).first()
        if not scan:
            return {"error": "Scan not found"}
        
        scan.status = "running"
        scan.started_at = datetime.utcnow()
        db.commit()
        
        # Run nikto command
        cmd = ["nikto", "-h", target_url, "-Format", "json"]
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=600)
        
        scan.results = result.stdout
        scan.status = "completed"
        scan.completed_at = datetime.utcnow()
        db.commit()
        
        return {"status": "completed", "scan_id": scan_id}
    
    except Exception as e:
        scan.status = "failed"
        scan.results = str(e)
        db.commit()
        return {"error": str(e)}
    
    finally:
        db.close()


@celery_app.task(bind=True)
def process_scan_results(self, scan_id: int):
    """Process scan results and create vulnerability records"""
    db = next(get_db())
    
    try:
        scan = db.query(Scan).filter(Scan.id == scan_id).first()
        if not scan or not scan.results:
            return {"error": "No results to process"}
        
        # Parse results and create vulnerabilities
        # This is a simplified example - in production, you'd parse actual scan output
        
        if scan.scan_type == "nikto":
            # Example: Create sample vulnerabilities from nikto output
            vuln = Vulnerability(
                title="Web Server Misconfiguration Detected",
                description="Nikto detected potential misconfigurations",
                severity="medium",
                target_id=scan.target_id,
                scan_id=scan.id,
                remediation="Review server configuration and disable unnecessary features"
            )
            db.add(vuln)
            db.commit()
        
        return {"status": "processed", "scan_id": scan_id}
    
    except Exception as e:
        return {"error": str(e)}
    
    finally:
        db.close()
