"""
Serviço de Workspaces
Criado por José - um desenvolvedor Full Stack
Lógica de negócio para workspaces colaborativos
"""

from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc, asc, func
from datetime import datetime, timedelta
import uuid
import secrets

from synapse.models.workspace import (
    Workspace, WorkspaceMember, WorkspaceProject, ProjectCollaborator,
    WorkspaceInvitation, WorkspaceActivity, ProjectComment, ProjectVersion,
    WorkspaceRole, PermissionLevel
)
from synapse.models.user import User
from synapse.models.workflow import Workflow
from synapse.schemas.workspace import (
    WorkspaceCreate, WorkspaceUpdate, MemberInvite,
    ProjectCreate, ProjectUpdate, CommentCreate
)

class WorkspaceService:
    """
    Serviço para gerenciar workspaces colaborativos
    """
    
    def __init__(self, db: Session):
        self.db = db
    
    # ==================== WORKSPACES ====================
    
    def create_workspace(self, workspace_data: WorkspaceCreate, owner_id: int) -> Workspace:
        """Cria um novo workspace"""
        
        # Gerar slug único
        slug = self._generate_unique_slug(workspace_data.name)
        
        workspace = Workspace(
            name=workspace_data.name,
            slug=slug,
            description=workspace_data.description,
            avatar_url=workspace_data.avatar_url,
            color=workspace_data.color or "#3B82F6",
            owner_id=owner_id,
            is_public=workspace_data.is_public or False,
            allow_guest_access=workspace_data.allow_guest_access or False,
            require_approval=workspace_data.require_approval or True,
            max_members=workspace_data.max_members or 10,
            max_projects=workspace_data.max_projects or 50,
            max_storage_mb=workspace_data.max_storage_mb or 1000,
            enable_real_time_editing=workspace_data.enable_real_time_editing or True,
            enable_comments=workspace_data.enable_comments or True,
            enable_chat=workspace_data.enable_chat or True,
            enable_video_calls=workspace_data.enable_video_calls or False,
            notification_settings=workspace_data.notification_settings or {}
        )
        
        self.db.add(workspace)
        self.db.commit()
        self.db.refresh(workspace)
        
        # Adicionar owner como membro
        self._add_member(workspace.id, owner_id, WorkspaceRole.OWNER)
        
        # Registrar atividade
        self._log_activity(
            workspace.id, owner_id, "created", "workspace", workspace.id,
            f"Workspace '{workspace.name}' foi criado"
        )
        
        return workspace
    
    def update_workspace(self, workspace_id: int, workspace_data: WorkspaceUpdate, user_id: int) -> Optional[Workspace]:
        """Atualiza um workspace"""
        
        workspace = self.get_workspace(workspace_id)
        if not workspace:
            return None
        
        # Verificar permissão
        if not self._has_permission(workspace_id, user_id, "admin_workspace"):
            raise PermissionError("Usuário não tem permissão para editar workspace")
        
        # Atualizar campos
        update_data = workspace_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            if hasattr(workspace, field):
                setattr(workspace, field, value)
        
        workspace.updated_at = datetime.utcnow()
        
        self.db.commit()
        self.db.refresh(workspace)
        
        # Registrar atividade
        self._log_activity(
            workspace_id, user_id, "updated", "workspace", workspace_id,
            f"Workspace '{workspace.name}' foi atualizado"
        )
        
        return workspace
    
    def get_workspace(self, workspace_id: int) -> Optional[Workspace]:
        """Obtém um workspace por ID"""
        return self.db.query(Workspace).filter(
            and_(
                Workspace.id == workspace_id,
                Workspace.status == "active"
            )
        ).first()
    
    def get_workspace_by_slug(self, slug: str) -> Optional[Workspace]:
        """Obtém um workspace por slug"""
        return self.db.query(Workspace).filter(
            and_(
                Workspace.slug == slug,
                Workspace.status == "active"
            )
        ).first()
    
    def get_user_workspaces(self, user_id: int) -> List[Workspace]:
        """Obtém workspaces do usuário"""
        
        # Workspaces onde é membro
        member_workspaces = self.db.query(Workspace).join(WorkspaceMember).filter(
            and_(
                WorkspaceMember.user_id == user_id,
                WorkspaceMember.status == "active",
                Workspace.status == "active"
            )
        ).all()
        
        return member_workspaces
    
    def delete_workspace(self, workspace_id: int, user_id: int) -> bool:
        """Deleta um workspace (soft delete)"""
        
        workspace = self.get_workspace(workspace_id)
        if not workspace:
            return False
        
        # Apenas owner pode deletar
        if workspace.owner_id != user_id:
            raise PermissionError("Apenas o proprietário pode deletar o workspace")
        
        workspace.status = "deleted"
        workspace.updated_at = datetime.utcnow()
        
        self.db.commit()
        
        return True
    
    # ==================== MEMBROS ====================
    
    def invite_member(self, workspace_id: int, invite_data: MemberInvite, inviter_id: int) -> WorkspaceInvitation:
        """Convida um membro para o workspace"""
        
        workspace = self.get_workspace(workspace_id)
        if not workspace:
            raise ValueError("Workspace não encontrado")
        
        # Verificar permissão
        if not self._has_permission(workspace_id, inviter_id, "invite_members"):
            raise PermissionError("Usuário não tem permissão para convidar membros")
        
        # Verificar limite de membros
        if workspace.member_count >= workspace.max_members:
            raise ValueError("Limite de membros atingido")
        
        # Verificar se já é membro
        existing_member = self.db.query(WorkspaceMember).filter(
            and_(
                WorkspaceMember.workspace_id == workspace_id,
                WorkspaceMember.user_id == self._get_user_by_email(invite_data.email)
            )
        ).first()
        
        if existing_member:
            raise ValueError("Usuário já é membro do workspace")
        
        # Verificar convite pendente
        existing_invitation = self.db.query(WorkspaceInvitation).filter(
            and_(
                WorkspaceInvitation.workspace_id == workspace_id,
                WorkspaceInvitation.email == invite_data.email,
                WorkspaceInvitation.status == "pending"
            )
        ).first()
        
        if existing_invitation:
            raise ValueError("Convite já enviado para este email")
        
        # Criar convite
        invitation = WorkspaceInvitation(
            workspace_id=workspace_id,
            inviter_id=inviter_id,
            email=invite_data.email,
            role=WorkspaceRole(invite_data.role),
            message=invite_data.message,
            token=secrets.token_urlsafe(32),
            expires_at=datetime.utcnow() + timedelta(days=7),
        )

        self.db.add(invitation)
        self.db.commit()
        self.db.refresh(invitation)

        # Registrar atividade
        self._log_activity(
            workspace_id,
            inviter_id,
            "invited",
            "member",
            None,
            f"Convidou {invite_data.email} para o workspace",
        )

        return invitation

    def accept_invitation(self, token: str, user_id: int) -> WorkspaceMember | None:
        """Aceita um convite de workspace"""

        invitation = (
            self.db.query(WorkspaceInvitation)
            .filter(
                and_(
                    WorkspaceInvitation.token == token,
                    WorkspaceInvitation.status == "pending",
                ),
            )
            .first()
        )

        if not invitation:
            return None

        if invitation.is_expired:
            invitation.status = "expired"
            self.db.commit()
            return None

        # Verificar se email corresponde ao usuário
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user or user.email != invitation.email:
            raise ValueError("Email não corresponde ao usuário")

        # Adicionar como membro
        member = self._add_member(invitation.workspace_id, user_id, invitation.role)

        # Atualizar convite
        invitation.status = "accepted"
        invitation.responded_at = datetime.utcnow()
        invitation.invited_user_id = user_id

        self.db.commit()

        # Registrar atividade
        self._log_activity(
            invitation.workspace_id,
            user_id,
            "joined",
            "member",
            user_id,
            f"{user.full_name} entrou no workspace",
        )

        return member

    def remove_member(self, workspace_id: int, member_id: int, remover_id: int) -> bool:
        """Remove um membro do workspace"""

        workspace = self.get_workspace(workspace_id)
        if not workspace:
            return False

        # Não pode remover o owner
        if workspace.owner_id == member_id:
            raise ValueError("Não é possível remover o proprietário")

        # Verificar permissão
        if not self._has_permission(workspace_id, remover_id, "remove_members"):
            raise PermissionError("Usuário não tem permissão para remover membros")

        member = (
            self.db.query(WorkspaceMember)
            .filter(
                and_(
                    WorkspaceMember.workspace_id == workspace_id,
                    WorkspaceMember.user_id == member_id,
                    WorkspaceMember.status == "active",
                ),
            )
            .first()
        )

        if not member:
            return False

        member.status = "left"
        member.left_at = datetime.utcnow()

        # Atualizar contador
        workspace.member_count -= 1

        self.db.commit()

        # Registrar atividade
        user = self.db.query(User).filter(User.id == member_id).first()
        self._log_activity(
            workspace_id,
            remover_id,
            "removed",
            "member",
            member_id,
            f"{user.full_name if user else 'Usuário'} foi removido do workspace",
        )

        return True

    def update_member_role(
        self,
        workspace_id: int,
        member_id: int,
        new_role: WorkspaceRole,
        updater_id: int,
    ) -> WorkspaceMember | None:
        """Atualiza papel de um membro"""

        # Verificar permissão
        if not self._has_permission(workspace_id, updater_id, "manage_roles"):
            raise PermissionError("Usuário não tem permissão para gerenciar papéis")

        member = (
            self.db.query(WorkspaceMember)
            .filter(
                and_(
                    WorkspaceMember.workspace_id == workspace_id,
                    WorkspaceMember.user_id == member_id,
                    WorkspaceMember.status == "active",
                ),
            )
            .first()
        )

        if not member:
            return None

        old_role = member.role
        member.role = new_role

        self.db.commit()
        self.db.refresh(member)

        # Registrar atividade
        user = self.db.query(User).filter(User.id == member_id).first()
        self._log_activity(
            workspace_id,
            updater_id,
            "role_changed",
            "member",
            member_id,
            f"Papel de {user.full_name if user else 'Usuário'} alterado de {old_role.value} para {new_role.value}",
        )

        return member

    def get_workspace_members(self, workspace_id: int) -> list[WorkspaceMember]:
        """Obtém membros do workspace"""
        return (
            self.db.query(WorkspaceMember)
            .filter(
                and_(
                    WorkspaceMember.workspace_id == workspace_id,
                    WorkspaceMember.status == "active",
                ),
            )
            .all()
        )

    # ==================== PROJETOS ====================

    def create_project(
        self, workspace_id: int, project_data: ProjectCreate, creator_id: int
    ) -> WorkspaceProject:
        """Cria um novo projeto no workspace"""

        workspace = self.get_workspace(workspace_id)
        if not workspace:
            raise ValueError("Workspace não encontrado")

        # Verificar permissão
        if not self._has_permission(workspace_id, creator_id, "create_projects"):
            raise PermissionError("Usuário não tem permissão para criar projetos")

        # Verificar limite de projetos
        if workspace.project_count >= workspace.max_projects:
            raise ValueError("Limite de projetos atingido")

        # Criar workflow se não fornecido
        workflow_id = project_data.workflow_id
        if not workflow_id:
            workflow = Workflow(
                name=project_data.name,
                description=project_data.description,
                user_id=creator_id,
                data={"nodes": [], "edges": []},
            )
            self.db.add(workflow)
            self.db.flush()
            workflow_id = workflow.id

        project = WorkspaceProject(
            workspace_id=workspace_id,
            workflow_id=workflow_id,
            name=project_data.name,
            description=project_data.description,
            color=project_data.color or "#10B981",
            allow_concurrent_editing=project_data.allow_concurrent_editing or True,
            auto_save_interval=project_data.auto_save_interval or 30,
            version_control_enabled=project_data.version_control_enabled or True,
        )

        self.db.add(project)

        # Atualizar contador
        workspace.project_count += 1

        self.db.commit()
        self.db.refresh(project)

        # Adicionar criador como colaborador
        self._add_project_collaborator(
            project.id, creator_id, can_edit=True, can_delete=True
        )

        # Registrar atividade
        self._log_activity(
            workspace_id,
            creator_id,
            "created",
            "project",
            project.id,
            f"Projeto '{project.name}' foi criado",
        )

        return project

    def update_project(
        self, project_id: int, project_data: ProjectUpdate, user_id: int
    ) -> WorkspaceProject | None:
        """Atualiza um projeto"""

        project = self.get_project(project_id)
        if not project:
            return None

        # Verificar permissão
        if not self._can_edit_project(project_id, user_id):
            raise PermissionError("Usuário não tem permissão para editar projeto")

        # Atualizar campos
        update_data = project_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            if hasattr(project, field):
                setattr(project, field, value)

        project.updated_at = datetime.utcnow()
        project.last_edited_at = datetime.utcnow()

        self.db.commit()
        self.db.refresh(project)

        # Registrar atividade
        self._log_activity(
            project.workspace_id,
            user_id,
            "updated",
            "project",
            project_id,
            f"Projeto '{project.name}' foi atualizado",
        )

        return project

    def get_project(self, project_id: int) -> WorkspaceProject | None:
        """Obtém um projeto por ID"""
        return (
            self.db.query(WorkspaceProject)
            .filter(
                and_(
                    WorkspaceProject.id == project_id,
                    WorkspaceProject.status == "active",
                ),
            )
            .first()
        )

    def get_workspace_projects(
        self, workspace_id: int, user_id: int
    ) -> list[WorkspaceProject]:
        """Obtém projetos do workspace que o usuário tem acesso"""

        # Verificar se é membro do workspace
        if not self._is_workspace_member(workspace_id, user_id):
            return []

        return (
            self.db.query(WorkspaceProject)
            .filter(
                and_(
                    WorkspaceProject.workspace_id == workspace_id,
                    WorkspaceProject.status == "active",
                ),
            )
            .all()
        )

    def delete_project(self, project_id: int, user_id: int) -> bool:
        """Deleta um projeto (soft delete)"""

        project = self.get_project(project_id)
        if not project:
            return False

        # Verificar permissão
        collaborator = (
            self.db.query(ProjectCollaborator)
            .filter(
                and_(
                    ProjectCollaborator.project_id == project_id,
                    ProjectCollaborator.user_id == user_id,
                    ProjectCollaborator.can_delete == True,
                ),
            )
            .first()
        )

        if not collaborator:
            raise PermissionError("Usuário não tem permissão para deletar projeto")

        project.status = "deleted"
        project.updated_at = datetime.utcnow()

        # Atualizar contador
        workspace = self.get_workspace(project.workspace_id)
        if workspace:
            workspace.project_count -= 1

        self.db.commit()

        # Registrar atividade
        self._log_activity(
            project.workspace_id,
            user_id,
            "deleted",
            "project",
            project_id,
            f"Projeto '{project.name}' foi deletado",
        )

        return True

    # ==================== COLABORAÇÃO ====================

    def add_project_collaborator(
        self, project_id: int, user_id: int, permissions: dict[str, bool], adder_id: int
    ) -> ProjectCollaborator:
        """Adiciona colaborador ao projeto"""

        project = self.get_project(project_id)
        if not project:
            raise ValueError("Projeto não encontrado")

        # Verificar se usuário é membro do workspace
        if not self._is_workspace_member(project.workspace_id, user_id):
            raise ValueError("Usuário não é membro do workspace")

        # Verificar permissão do adder
        if not self._can_edit_project(project_id, adder_id):
            raise PermissionError(
                "Usuário não tem permissão para adicionar colaboradores"
            )

        # Verificar se já é colaborador
        existing = (
            self.db.query(ProjectCollaborator)
            .filter(
                and_(
                    ProjectCollaborator.project_id == project_id,
                    ProjectCollaborator.user_id == user_id,
                ),
            )
            .first()
        )

        if existing:
            raise ValueError("Usuário já é colaborador do projeto")

        collaborator = ProjectCollaborator(
            project_id=project_id,
            user_id=user_id,
            can_edit=permissions.get("can_edit", True),
            can_comment=permissions.get("can_comment", True),
            can_share=permissions.get("can_share", False),
            can_delete=permissions.get("can_delete", False),
        )

        self.db.add(collaborator)

        # Atualizar contador
        project.collaborator_count += 1

        self.db.commit()
        self.db.refresh(collaborator)

        # Registrar atividade
        user = self.db.query(User).filter(User.id == user_id).first()
        self._log_activity(
            project.workspace_id,
            adder_id,
            "added_collaborator",
            "project",
            project_id,
            f"{user.full_name if user else 'Usuário'} foi adicionado como colaborador",
        )

        return collaborator

    def create_comment(
        self, project_id: int, comment_data: CommentCreate, user_id: int
    ) -> ProjectComment:
        """Cria um comentário no projeto"""

        project = self.get_project(project_id)
        if not project:
            raise ValueError("Projeto não encontrado")

        # Verificar permissão
        if not self._can_comment_project(project_id, user_id):
            raise PermissionError("Usuário não tem permissão para comentar")

        comment = ProjectComment(
            project_id=project_id,
            user_id=user_id,
            parent_id=comment_data.parent_id,
            content=comment_data.content,
            content_type=comment_data.content_type or "text",
            node_id=comment_data.node_id,
            position_x=comment_data.position_x,
            position_y=comment_data.position_y,
        )

        self.db.add(comment)

        # Atualizar contador
        project.comment_count += 1

        self.db.commit()
        self.db.refresh(comment)

        # Registrar atividade
        self._log_activity(
            project.workspace_id,
            user_id,
            "commented",
            "project",
            project_id,
            f"Adicionou comentário no projeto '{project.name}'",
        )

        return comment

    def get_project_comments(
        self, project_id: int, user_id: int
    ) -> list[ProjectComment]:
        """Obtém comentários do projeto"""

        # Verificar acesso ao projeto
        if not self._can_view_project(project_id, user_id):
            return []

        return (
            self.db.query(ProjectComment)
            .filter(
                ProjectComment.project_id == project_id,
            )
            .order_by(ProjectComment.created_at)
            .all()
        )

    # ==================== ATIVIDADES ====================

    def get_workspace_activities(
        self, workspace_id: int, user_id: int, limit: int = 50
    ) -> list[WorkspaceActivity]:
        """Obtém atividades do workspace"""

        # Verificar se é membro
        if not self._is_workspace_member(workspace_id, user_id):
            return []

        return (
            self.db.query(WorkspaceActivity)
            .filter(
                WorkspaceActivity.workspace_id == workspace_id,
            )
            .order_by(desc(WorkspaceActivity.created_at))
            .limit(limit)
            .all()
        )

    # ==================== MÉTODOS AUXILIARES ====================

    def _generate_unique_slug(self, name: str) -> str:
        """Gera slug único para workspace"""
        import re

        base_slug = re.sub(r"[^a-zA-Z0-9\s-]", "", name.lower())
        base_slug = re.sub(r"\s+", "-", base_slug).strip("-")

        slug = base_slug
        counter = 1

        while self.db.query(Workspace).filter(Workspace.slug == slug).first():
            slug = f"{base_slug}-{counter}"
            counter += 1

        return slug

    def _add_member(
        self, workspace_id: int, user_id: int, role: WorkspaceRole
    ) -> WorkspaceMember:
        """Adiciona membro ao workspace"""

        member = WorkspaceMember(
            workspace_id=workspace_id,
            user_id=user_id,
            role=role,
        )

        self.db.add(member)

        # Atualizar contador
        workspace = self.get_workspace(workspace_id)
        if workspace:
            workspace.member_count += 1

        self.db.flush()

        return member

    def _add_project_collaborator(
        self, project_id: int, user_id: int, **permissions
    ) -> ProjectCollaborator:
        """Adiciona colaborador ao projeto"""

        collaborator = ProjectCollaborator(
            project_id=project_id,
            user_id=user_id,
            **permissions,
        )

        self.db.add(collaborator)
        self.db.flush()

        return collaborator

    def _has_permission(self, workspace_id: int, user_id: int, permission: str) -> bool:
        """Verifica se usuário tem permissão específica"""

        member = (
            self.db.query(WorkspaceMember)
            .filter(
                and_(
                    WorkspaceMember.workspace_id == workspace_id,
                    WorkspaceMember.user_id == user_id,
                    WorkspaceMember.status == "active",
                ),
            )
            .first()
        )

        if not member:
            return False

        return member.has_permission(permission)

    def _is_workspace_member(self, workspace_id: int, user_id: int) -> bool:
        """Verifica se usuário é membro do workspace"""

        return (
            self.db.query(WorkspaceMember)
            .filter(
                and_(
                    WorkspaceMember.workspace_id == workspace_id,
                    WorkspaceMember.user_id == user_id,
                    WorkspaceMember.status == "active",
                ),
            )
            .first()
            is not None
        )

    def _can_edit_project(self, project_id: int, user_id: int) -> bool:
        """Verifica se usuário pode editar projeto"""

        collaborator = (
            self.db.query(ProjectCollaborator)
            .filter(
                and_(
                    ProjectCollaborator.project_id == project_id,
                    ProjectCollaborator.user_id == user_id,
                    ProjectCollaborator.can_edit == True,
                ),
            )
            .first()
        )

        return collaborator is not None

    def _can_comment_project(self, project_id: int, user_id: int) -> bool:
        """Verifica se usuário pode comentar no projeto"""

        collaborator = (
            self.db.query(ProjectCollaborator)
            .filter(
                and_(
                    ProjectCollaborator.project_id == project_id,
                    ProjectCollaborator.user_id == user_id,
                    ProjectCollaborator.can_comment == True,
                ),
            )
            .first()
        )

        return collaborator is not None

    def _can_view_project(self, project_id: int, user_id: int) -> bool:
        """Verifica se usuário pode visualizar projeto"""

        project = self.get_project(project_id)
        if not project:
            return False

        return self._is_workspace_member(project.workspace_id, user_id)

    def _get_user_by_email(self, email: str) -> int | None:
        """Obtém ID do usuário por email"""
        user = self.db.query(User).filter(User.email == email).first()
        return user.id if user else None

    def _log_activity(
        self,
        workspace_id: int,
        user_id: int,
        action: str,
        resource_type: str,
        resource_id: int | None,
        description: str,
    ):
        """Registra atividade no workspace"""

        activity = WorkspaceActivity(
            workspace_id=workspace_id,
            user_id=user_id,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            description=description,
        )

        self.db.add(activity)

        # Atualizar contador de atividades
        workspace = self.get_workspace(workspace_id)
        if workspace:
            workspace.activity_count += 1
            workspace.last_activity_at = datetime.utcnow()

    # ==================== ANALYTICS ====================

    def get_workspace_stats(self, workspace_id: int, user_id: int) -> dict[str, Any]:
        """Obtém estatísticas do workspace"""

        if not self._is_workspace_member(workspace_id, user_id):
            raise PermissionError("Usuário não é membro do workspace")

        workspace = self.get_workspace(workspace_id)
        if not workspace:
            return {}

        # Estatísticas básicas
        stats = {
            "member_count": workspace.member_count,
            "project_count": workspace.project_count,
            "activity_count": workspace.activity_count,
            "storage_used_mb": workspace.storage_used_mb,
            "storage_limit_mb": workspace.max_storage_mb,
            "storage_usage_percent": (
                (workspace.storage_used_mb / workspace.max_storage_mb) * 100
                if workspace.max_storage_mb > 0
                else 0
            ),
        }

        # Atividade recente (últimos 30 dias)
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        recent_activities = (
            self.db.query(WorkspaceActivity)
            .filter(
                and_(
                    WorkspaceActivity.workspace_id == workspace_id,
                    WorkspaceActivity.created_at >= thirty_days_ago,
                ),
            )
            .count()
        )

        stats["recent_activity_count"] = recent_activities

        # Projetos ativos (editados nos últimos 7 dias)
        seven_days_ago = datetime.utcnow() - timedelta(days=7)
        active_projects = (
            self.db.query(WorkspaceProject)
            .filter(
                and_(
                    WorkspaceProject.workspace_id == workspace_id,
                    WorkspaceProject.last_edited_at >= seven_days_ago,
                    WorkspaceProject.status == "active",
                ),
            )
            .count()
        )

        stats["active_projects"] = active_projects

        return stats
