ROLES = {
    "admin": {
        "description": "System administrator with full access",
        "permissions": ["*:*:*"]
    },
    "apple": {
        "description": "Apple - full access to all Apple modules",
        "permissions": [
            "apple:awards:*",
            "apple:finance:*",
            "apple:assets:*",
            "apple:students:*",
            "shared:files:*",
            "shared:ocr:*",
            "shared:ai:*",
            "shared:audit:read",
            "shared:approvals:*",
        ]
    },
    "danielle": {
        "description": "Danielle - awards and students focus",
        "permissions": [
            "apple:awards:*",
            "apple:students:*",
            "shared:files:*",
            "shared:ocr:read",
            "shared:ai:read",
            "shared:audit:read",
        ]
    },
    "steven": {
        "description": "Steven - finance and assets focus",
        "permissions": [
            "apple:finance:*",
            "apple:assets:*",
            "shared:files:*",
            "shared:ocr:read",
            "shared:ai:read",
            "shared:audit:read",
        ]
    },
    "tommy": {
        "description": "Tommy - students and attendance focus",
        "permissions": [
            "apple:students:*",
            "apple:awards:read",
            "shared:files:read",
            "shared:ocr:read",
            "shared:audit:read",
        ]
    },
    "wendy": {
        "description": "Wendy - awards and certificates focus",
        "permissions": [
            "apple:awards:*",
            "apple:students:read",
            "shared:files:*",
            "shared:ocr:*",
            "shared:ai:read",
            "shared:audit:read",
        ]
    },
    "leung": {
        "description": "Leung - read-only access to reports",
        "permissions": [
            "apple:awards:read",
            "apple:finance:read",
            "apple:assets:read",
            "apple:students:read",
            "shared:files:read",
            "shared:audit:read",
        ]
    },
    "reviewer": {
        "description": "Reviewer - approval workflow participant",
        "permissions": [
            "apple:awards:read",
            "apple:finance:read",
            "apple:assets:read",
            "apple:students:read",
            "shared:files:read",
            "shared:ocr:read",
            "shared:audit:read",
            "shared:approvals:read",
            "shared:approvals:approve",
        ]
    },
}


def get_role_permissions(role: str) -> list[str]:
    if role not in ROLES:
        return []
    return ROLES[role]["permissions"]


def check_permission(user_permissions: list[str], required: str) -> bool:
    if "*:*:*" in user_permissions:
        return True
    module, resource, action = required.split(":")
    for perm in user_permissions:
        p_mod, p_res, p_act = perm.split(":")
        mod_match = p_mod == "*" or p_mod == module
        res_match = p_res == "*" or p_res == resource
        act_match = p_act == "*" or p_act == action
        if mod_match and res_match and act_match:
            return True
    return False
