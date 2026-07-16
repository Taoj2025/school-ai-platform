import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from logging.config import fileConfig

from alembic import context
from sqlalchemy import engine_from_config, pool

from app.core.config import settings
from app.db.base import Base

# Import all models so Alembic can detect them
from app.modules.accounts.models import Role, RolePermission, User, user_roles  # noqa
from app.modules.files.models import File  # noqa
from app.modules.ocr.models import OcrJob  # noqa
from app.modules.ai.models import AiJob  # noqa
from app.modules.audit.models import AuditLog  # noqa
from app.modules.approvals.models import Approval  # noqa
from app.modules.apple.awards.models import Award, AwardRecipient  # noqa
from app.modules.apple.finance.models import FinanceRecord, Quotation  # noqa
from app.modules.apple.assets.models import Asset, AssetMovement  # noqa
from app.modules.apple.students.models import Attendance, CertificateRequest, Student  # noqa

config = context.config
config.set_main_option("sqlalchemy.url", settings.DATABASE_URL_SYNC)

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
