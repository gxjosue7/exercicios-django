from math import ceil

from rest_framework.exceptions import ValidationError
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response


class Paginacao(PageNumberPagination):
    page_size_query_param = "page_size"
    max_page_size = 100

    def paginate_queryset(self, queryset, request, view=None):
        tamanho = request.query_params.get(self.page_size_query_param)
        if tamanho is not None and tamanho.isdigit() and int(tamanho) > self.max_page_size:
            raise ValidationError({"page_size": f"O page_size não pode passar de {self.max_page_size}."})

        page_size = self.get_page_size(request)
        self.paginator = self.django_paginator_class(queryset, page_size)
        try:
            self.page_number = int(request.query_params.get(self.page_query_param, 1))
        except ValueError:
            raise ValidationError({"page": "Informe um número inteiro positivo."})
        if self.page_number < 1:
            raise ValidationError({"page": "Informe um número inteiro positivo."})

        self.total_pages = ceil(self.paginator.count / page_size)
        # página além da última: 200 com lista vazia (mesmo contrato das aulas de Express/FastAPI)
        if self.page_number > self.total_pages:
            return []
        return list(self.paginator.page(self.page_number))

    def get_paginated_response(self, data):
        return Response({
            "page": self.page_number,
            "page_size": self.paginator.per_page,
            "total_pages": self.total_pages,
            "results": data,
        })

    def get_paginated_response_schema(self, schema):
        return {
            "type": "object",
            "properties": {
                "page": {"type": "integer"},
                "page_size": {"type": "integer"},
                "total_pages": {"type": "integer"},
                "results": schema,
            },
        }
