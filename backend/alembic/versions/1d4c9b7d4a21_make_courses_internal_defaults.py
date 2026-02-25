"""make courses internal defaults

Revision ID: 1d4c9b7d4a21
Revises: 27fa11dd4fab
Create Date: 2026-02-23 20:18:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "1d4c9b7d4a21"
down_revision: Union[str, Sequence[str], None] = "27fa11dd4fab"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("UPDATE courses SET provider = 'Naviq' WHERE provider IS NULL OR provider = ''")

    op.alter_column(
        "courses",
        "provider",
        existing_type=sa.String(length=100),
        nullable=False,
        server_default="Naviq",
    )
    op.alter_column(
        "courses",
        "url",
        existing_type=sa.Text(),
        nullable=True,
    )


def downgrade() -> None:
    op.alter_column(
        "courses",
        "url",
        existing_type=sa.Text(),
        nullable=False,
    )
    op.alter_column(
        "courses",
        "provider",
        existing_type=sa.String(length=100),
        nullable=False,
        server_default=None,
    )
