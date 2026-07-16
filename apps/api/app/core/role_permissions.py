APPLE_PERMISSIONS = {
    "apple:awards:read": "Read awards and scholarship data",
    "apple:awards:write": "Create and edit awards",
    "apple:awards:approve": "Approve awards and scholarships",
    "apple:finance:read": "Read finance records",
    "apple:finance:write": "Create and edit finance records",
    "apple:finance:approve": "Approve finance records",
    "apple:assets:read": "Read asset data",
    "apple:assets:write": "Create and edit assets",
    "apple:assets:approve": "Approve asset changes",
    "apple:students:read": "Read student data",
    "apple:students:write": "Create and edit students",
    "apple:students:approve": "Approve student certificates",
}

ROLE_PERMISSIONS: dict[str, list[str]] = {
    "admin": list(APPLE_PERMISSIONS.keys()) + [
        "system:users:read", "system:users:write",
        "system:roles:read", "system:roles:write",
        "system:audit:read", "system:config:read", "system:config:write",
    ],
    "apple": list(APPLE_PERMISSIONS.keys()),
    "danielle": [
        "danielle:hostel_payments:read", "danielle:hostel_payments:write",
        "danielle:hostel_payments:approve",
    ],
    "steven": [
        "steven:procurement:read", "steven:procurement:write",
        "steven:inventory:read", "steven:inventory:write",
    ],
    "tommy": [
        "tommy:archive_documents:read", "tommy:archive_documents:write",
        "tommy:archive_documents:delete",
    ],
    "wendy": [
        "wendy:notices:read", "wendy:notices:write",
        "wendy:calendar:read", "wendy:calendar:write",
    ],
    "leung": [
        "leung:payroll:read", "leung:payroll:write",
        "leung:payroll:export", "leung:tasks:read", "leung:tasks:write",
    ],
    "reviewer": [
        "apple:awards:read", "apple:awards:approve",
        "apple:finance:read", "apple:finance:approve",
        "apple:assets:read", "apple:assets:approve",
        "apple:students:read", "apple:students:approve",
    ],
}
