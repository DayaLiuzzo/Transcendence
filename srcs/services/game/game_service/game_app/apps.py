from django.apps import AppConfig


class GameAppConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'game_app'
    
    def ready(self):
        import game_app.signals