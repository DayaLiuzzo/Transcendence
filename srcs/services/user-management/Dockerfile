FROM python:3.12.7

# WORKDIR	.

# copier les requirements
RUN		pip install --upgrade pip
RUN		pip install django
COPY	requirements.txt .
RUN		pip install -r requirements.txt

COPY	./app_usermanagement .


ENTRYPOINT ["python", "manage.py", "runserver", "0.0.0.0:8000"]