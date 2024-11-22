FROM python:3.9


COPY auth_app .
COPY ./conf/requirements.txt .


RUN pip install --upgrade pip && pip install -r requirements.txt

RUN python manage.py makemigrations --noinput
RUN python manage.py migrate --noinput

CMD ["python", "manage.py", "runserver", "0.0.0.0:8003"]
