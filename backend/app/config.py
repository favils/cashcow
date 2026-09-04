from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    database_url: str
    secret_key: str
    frontend_origin: str = "http://localhost:5173"

    s3_bucket_name: str | None = None

    model_config = SettingsConfigDict(env_file=".env")

    @property
    def s3_configured(self) -> bool:
        return bool(self.s3_bucket_name)

settings = Settings()
