from django.db import models


def avatar_upload_to(instance, filename):
    # Use the user ID to create a unique file name
    ext = filename.split('.')[-1]
    return f'avatars/users_avatars/{instance.user.id}_{filename}'

class UserProfile(models.Model):
    username = models.CharField(max_length=100, unique=True)
    biography = models.TextField()
    friends = models.ManyToManyField("self", blank=True, symmetrical=False)
    avatar = models.ImageField( upload_to=avatar_upload_to, default='avatars/default_avatars/default.png', blank=True, null=True)
    
    @property
    def is_authenticated(self):
        return True

    def add_friend(self, friend_profile):
        if friend_profile != self and not self.friends.filter(pk=friend_profile.pk).exists():
            self.friends.add(friend_profile)
    
    def get_friends(self):
        return self.friends.all()
    
    def is_friend(self, friend_profile):
        return self.friends.filter(pk=friend_profile.pk).exists()

    def remove_friend(self, friend_profile):
        if self.friends.filter(pk=friend_profile.pk).exists():
            self.friends.remove(friend_profile)
