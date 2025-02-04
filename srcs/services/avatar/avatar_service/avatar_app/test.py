import unittest
from io import BytesIO
from PIL import Image
from django.core.files.uploadedfile import SimpleUploadedFile
from avatar_app.serializers import UserAvatarSerializer

class UserAvatarSerializerTest(unittest.TestCase):

    def create_test_image(self, format="JPEG", size=(100, 100)):
        """Helper function to create a valid in-memory image file."""
        img = Image.new("RGB", size, color=(255, 0, 0))  # Create a red image
        img_io = BytesIO()
        img.save(img_io, format=format)
        img_io.seek(0)
        return SimpleUploadedFile(f"test.{format.lower()}", img_io.read(), content_type=f"image/{format.lower()}")

    def test_valid_image(self):
        """Test serializer with a valid JPEG image."""
        image = self.create_test_image(format="JPEG")
        serializer = UserAvatarSerializer(data={"avatar": image})
        self.assertTrue(serializer.is_valid(), serializer.errors)

    def test_invalid_format(self):
        """Test serializer with a non-image file (TXT file)."""
        text_file = SimpleUploadedFile("document.txt", b"Hello, World!", content_type="text/plain")
        serializer = UserAvatarSerializer(data={"avatar": text_file})
        self.assertFalse(serializer.is_valid())
        self.assertIn("avatar", serializer.errors)

    def test_unsupported_image_format(self):
        """Test serializer with an unsupported image format (GIF)."""
        gif_file = self.create_test_image(format="GIF")
        serializer = UserAvatarSerializer(data={"avatar": gif_file})
        self.assertFalse(serializer.is_valid())
        self.assertIn("avatar", serializer.errors)

    def test_large_image(self):
        """Test serializer with a file larger than 5MB."""
        large_image = self.create_test_image(format="JPEG", size=(50000,50000))  # Large image
        serializer = UserAvatarSerializer(data={"avatar": large_image})
        self.assertFalse(serializer.is_valid())
        self.assertIn("avatar", serializer.errors)

if __name__ == "__main__":
    unittest.main()
