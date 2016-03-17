# SENG3011 - Team 'Madd Damon'

## Links

* [Team Website (GitHub Pages)](http://henry-alakazhang.github.io/seng3011/)

* [Course Notes](http://webapps.cse.unsw.edu.au/webcms2/works/index.php?inc=LN&cid=2432&color=deepblue)

### Development
* [Django REST Framework reference](http://www.django-rest-framework.org)

### Documentation

* [Meeting 1 Notes](https://docs.google.com/document/d/1koA0tsC2MoPuagHAUUKljK99tAOj72dnDmCsCsjobJI/edit?usp=sharing)


## Development environment setup instructions

For Python 3.4 setup look [here](http://tutorial.djangogirls.org/en/python_installation/index.html)

Please use [Virtual Environment](https://virtualenv.pypa.io/en/latest/) to maintain consistent versions of Django and other packages. 

1. `cd` into seng3011 folder

2. create a `venv` here using the following command: `python3 -m venv venv`(Linux & OSX). [Windows instructions](http://tutorial.djangogirls.org/en/django_installation/index.html#windows). 

3. It should now have created a venv folder, activate the virtual environment using `source venv/bin/activate`(Linux & OSX). `myvenv\Scripts\activate`(Windows). 

4. After running `python`, you should get `Python 3.4.3 (v3.4.3:9`... `exit()`

5. `pip install -r requirements.txt`

6. Run `python manage.py runserver`. Then go to [http://127.0.0.1:8000](http://127.0.0.1:8000)








