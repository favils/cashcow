from enum import Enum

class ATMStatus(str, Enum):
    OPERATIONAL = "Operational"
    LOW_CASH = "Low Cash"
    MAINTENANCE = "MAINTENANCE"
    OFFLINE = "OFFLINE"

class ServicePriority(str, Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    CRITICAL = "Critical"

class ServiceStatus(str, Enum):
    PENDING = "Pending"
    IN_PROGRESS = "In-Progress"
    COMPLETED = "Completed"
    FAILED = "Failed"

class UserRole(str, Enum):
    OPERATIONS_ADMIN = "Operations Admin"
    FIELD_TECHNICIAN = "Field Technician"
    AUDITOR = "Auditor"