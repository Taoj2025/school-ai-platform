from fastapi import APIRouter

router = APIRouter(prefix="/approvals", tags=["approvals"])


@router.get("/")
async def list_approvals():
    return {"message": "Approvals list endpoint"}
