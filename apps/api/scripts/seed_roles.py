"""Seed initial roles and permissions into the database."""
import asyncio
import uuid

from sqlalchemy import select

from app.db.session import async_session_factory
from app.modules.accounts.models import Role, RolePermission
from app.core.role_permissions import ROLE_PERMISSIONS


async def seed_roles_and_permissions():
    async with async_session_factory() as db:
        for role_name, permissions in ROLE_PERMISSIONS.items():
            result = await db.execute(select(Role).where(Role.name == role_name))
            role = result.scalar_one_or_none()
            if not role:
                role = Role(id=str(uuid.uuid4()), name=role_name, description=f"Role: {role_name}")
                db.add(role)
                await db.flush()

            for perm in permissions:
                exists = await db.execute(
                    select(RolePermission).where(
                        RolePermission.role_id == role.id,
                        RolePermission.permission == perm,
                    )
                )
                if exists.scalar_one_or_none() is None:
                    db.add(RolePermission(
                        id=str(uuid.uuid4()),
                        role_id=role.id,
                        permission=perm,
                    ))

        await db.commit()
        print("Roles and permissions seeded successfully.")


if __name__ == "__main__":
    asyncio.run(seed_roles_and_permissions())
