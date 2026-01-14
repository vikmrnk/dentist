from rest_framework.permissions import BasePermission


class IsRegistrarOrAdmin(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        groups = set(user.groups.values_list("name", flat=True))
        return "registrar" in groups or "admin" in groups

