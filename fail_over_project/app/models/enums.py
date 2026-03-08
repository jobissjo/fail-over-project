from enum import Enum


class MediaStructure(str, Enum):
    SINGLE = "single"
    SERIES = "series"


class StatusCategory(str, Enum):
    TODO = "todo"
    ACTIVE = "active"
    DONE = "done"


class MediaRequestType(str, Enum):
    ADD = "add"
    UPDATE = "update"


class MediaRequestStatus(str, Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    RESOLVING = "resolving"
    RESOLVED = "resolved"
    REJECTED = "rejected"
