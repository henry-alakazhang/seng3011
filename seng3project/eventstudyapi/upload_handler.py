# Functions to handle uploaded files here.


# Function to handle uploaded file
# Reference: https://docs.djangoproject.com/en/1.9/topics/http/file-uploads/
def handle_uploaded_file(f):
    filepath = ('seng3project/media/' + str(f))
    with open(filepath, 'wb+') as destination:
        for chunk in f.chunks():
            destination.write(chunk)