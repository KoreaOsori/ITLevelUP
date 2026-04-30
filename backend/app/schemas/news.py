from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Any
from uuid import UUID

class NewsBase(BaseModel):
    title: str
    url: str
    summary: Optional[str] = None
    source: Optional[str] = None
    category: Optional[str] = "General"
    content_type: Optional[str] = "News"
    published_at: Optional[datetime] = None

class NewsCreate(NewsBase):
    pass

class News(NewsBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True
