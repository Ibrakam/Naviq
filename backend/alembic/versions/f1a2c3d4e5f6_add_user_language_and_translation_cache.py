"""add user language preference and translation cache

Revision ID: f1a2c3d4e5f6
Revises: e6c9a91b2d31
Create Date: 2026-02-25 06:10:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "f1a2c3d4e5f6"
down_revision: Union[str, Sequence[str], None] = "e6c9a91b2d31"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column("preferred_language", sa.String(length=2), nullable=False, server_default=sa.text("'ru'")),
    )

    op.create_table(
        "translation_cache",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("source_hash", sa.String(length=64), nullable=False),
        sa.Column("source_text", sa.Text(), nullable=False),
        sa.Column("source_lang", sa.String(length=8), nullable=False, server_default=sa.text("'auto'")),
        sa.Column("target_lang", sa.String(length=8), nullable=False),
        sa.Column("translated_text", sa.Text(), nullable=False),
        sa.Column("provider", sa.String(length=64), nullable=True, server_default=sa.text("'openai'")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("source_hash", "source_lang", "target_lang", name="uq_translation_cache_source_target"),
    )
    op.create_index(op.f("ix_translation_cache_source_hash"), "translation_cache", ["source_hash"], unique=False)
    op.create_index(op.f("ix_translation_cache_source_lang"), "translation_cache", ["source_lang"], unique=False)
    op.create_index(op.f("ix_translation_cache_target_lang"), "translation_cache", ["target_lang"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_translation_cache_target_lang"), table_name="translation_cache")
    op.drop_index(op.f("ix_translation_cache_source_lang"), table_name="translation_cache")
    op.drop_index(op.f("ix_translation_cache_source_hash"), table_name="translation_cache")
    op.drop_table("translation_cache")

    op.drop_column("users", "preferred_language")
