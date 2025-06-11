"""
Migração para criar tabela user_variables
Criado por José - um desenvolvedor Full Stack
"""
from alembic import op
import sqlalchemy as sa
from datetime import datetime

# revision identifiers
revision = '001_create_user_variables'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    """
    Cria a tabela user_variables
    """
    op.create_table(
        'user_variables',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('key', sa.String(length=255), nullable=False),
        sa.Column('value', sa.Text(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('is_encrypted', sa.Boolean(), nullable=False, default=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, default=True),
        sa.Column('category', sa.String(length=100), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, default=datetime.utcnow),
        sa.Column('updated_at', sa.DateTime(), nullable=False, default=datetime.utcnow),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.Index('ix_user_variables_user_id', 'user_id'),
        sa.Index('ix_user_variables_key', 'key'),
        sa.Index('ix_user_variables_user_key', 'user_id', 'key', unique=True),
        sa.Index('ix_user_variables_category', 'category'),
        sa.Index('ix_user_variables_is_active', 'is_active'),
    )

def downgrade():
    """
    Remove a tabela user_variables
    """
    op.drop_table('user_variables')

