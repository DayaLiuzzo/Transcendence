# import requests

# def send_request(url:str, method:str, body={}, headers={}) -> int:
#     req_methods = {
#             'post':requests.post,
#             'delete':requests.delete,
#             'update':requests.put,
#             'patch':requests.patch,
#             }
#     response = req_methods[method](url, json=body ,headers=headers)
#     print(f'Request at url {url} return {response.status_code}')
#     return response.status_code

# def send_create_requests(urls:list, body={}, headers={}) -> bool:
#     successefull_elements = []
#     for url in urls:
#         if send_request(url=url, method='post', body=body, headers=headers) != 201:
#             break
#         else:
#             successefull_elements.append(url)
#     if len(urls) != len(successefull_elements):
#         # for url in successefull_elements:
#         #     rollback_url = url.replace('create', 'delete') + body['username'] + '/' 
#         #     send_request(url=rollback_url, method='delete', headers=headers)
#         return False
#     return True