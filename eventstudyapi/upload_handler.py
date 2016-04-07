# Functions to handle uploaded files here.
import os


# Function to handle uploaded file
# Reference: https://docs.djangoproject.com/en/1.9/topics/http/file-uploads/
def handle_uploaded_file(f, key):
    # filepath = os.path.join(os.path.dirname(os.path.realpath(__file__)), 'media/',str(f))
    # print(GDRAT_abs_path)
    filepath = ('media/' + str(key) + '_' + str(f))
    with open(filepath, 'wb+') as destination:
        for chunk in f.chunks():
            destination.write(chunk)