FROM python:3.9


COPY rooms_app .
COPY ./conf/requirements.txt .


RUN pip install --upgrade pip && pip install -r requirements.txt

EXPOSE 8000

CMD ["python", "manage.py", "runserver", "0.0.0.0:8005"]
