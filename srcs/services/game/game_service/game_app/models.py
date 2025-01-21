from django.db import models

class CustomUser(models.Model):
    username = models.CharField(max_length=100, unique=True)
    biography = models.TextField()
    
    @property
    def is_authenticated(self):
        return True