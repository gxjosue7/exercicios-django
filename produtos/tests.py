from rest_framework.test import APITestCase

from .models import Produto


class CrudTests(APITestCase):
    def setUp(self):
        self.produto = Produto.objects.create(nome="Mouse", preco="50.00")

    def test_listar_e_detalhar(self):
        self.assertEqual(self.client.get("/api/produtos/").status_code, 200)
        self.assertEqual(self.client.get(f"/api/produtos/{self.produto.id}/").status_code, 200)
        self.assertEqual(self.client.get("/api/produtos/999/").status_code, 404)

    def test_criar_atualizar_e_excluir(self):
        r = self.client.post("/api/produtos/", {"nome": "Cabo USB", "preco": "20.00"}, format="json")
        self.assertEqual(r.status_code, 201)
        pk = r.json()["id"]
        r = self.client.put(f"/api/produtos/{pk}/", {"nome": "Cabo USB-C", "preco": "25.00"}, format="json")
        self.assertEqual((r.status_code, r.json()["nome"]), (200, "Cabo USB-C"))
        self.assertEqual(self.client.delete(f"/api/produtos/{pk}/").status_code, 204)
        self.assertEqual(self.client.get(f"/api/produtos/{pk}/").status_code, 404)

    def test_documentacao(self):
        self.assertEqual(self.client.get("/api/schema/").status_code, 200)
        self.assertEqual(self.client.get("/api/docs/").status_code, 200)


class FiltroTests(APITestCase):
    def setUp(self):
        for nome, preco in (("Cabo", "20.00"), ("Mouse", "80.00"), ("Teclado", "250.00"), ("Monitor", "1200.00")):
            Produto.objects.create(nome=nome, preco=preco)

    def nomes(self, consulta):
        r = self.client.get(f"/api/produtos/?{consulta}")
        self.assertEqual(r.status_code, 200)
        return sorted(p["nome"] for p in r.json()["results"])

    def test_preco_minimo(self):
        self.assertEqual(self.nomes("preco_minimo=250"), ["Monitor", "Teclado"])

    def test_preco_maximo(self):
        self.assertEqual(self.nomes("preco_maximo=80"), ["Cabo", "Mouse"])

    def test_intervalo(self):
        self.assertEqual(self.nomes("preco_minimo=50&preco_maximo=300"), ["Mouse", "Teclado"])

    def test_sem_resultados(self):
        self.assertEqual(self.nomes("preco_minimo=5000"), [])

    def test_valor_nao_numerico(self):
        self.assertEqual(self.client.get("/api/produtos/?preco_minimo=abc").status_code, 400)


class OrdenacaoEBuscaTests(APITestCase):
    def setUp(self):
        for nome, preco in (("Teclado USB", "250.00"), ("Mouse USB", "80.00"), ("Cabo HDMI", "20.00"), ("Monitor", "1200.00")):
            Produto.objects.create(nome=nome, preco=preco)

    def nomes(self, consulta):
        r = self.client.get(f"/api/produtos/?{consulta}")
        self.assertEqual(r.status_code, 200)
        return [p["nome"] for p in r.json()["results"]]

    def test_ordem_padrao_por_id(self):
        self.assertEqual(self.nomes(""), ["Teclado USB", "Mouse USB", "Cabo HDMI", "Monitor"])

    def test_ordenar_por_nome(self):
        self.assertEqual(self.nomes("ordering=nome"), ["Cabo HDMI", "Monitor", "Mouse USB", "Teclado USB"])
        self.assertEqual(self.nomes("ordering=-nome")[0], "Teclado USB")

    def test_ordenar_por_preco(self):
        self.assertEqual(self.nomes("ordering=preco")[0], "Cabo HDMI")
        self.assertEqual(self.nomes("ordering=-preco")[0], "Monitor")

    def test_busca_parcial_sem_diferenciar_maiusculas(self):
        self.assertEqual(sorted(self.nomes("search=usb")), ["Mouse USB", "Teclado USB"])
        self.assertEqual(self.nomes("search=MONI"), ["Monitor"])

    def test_busca_sem_resultados(self):
        self.assertEqual(self.nomes("search=inexistente"), [])

    def test_combinar_filtro_busca_e_ordenacao(self):
        self.assertEqual(self.nomes("preco_minimo=100&search=usb&ordering=nome"), ["Teclado USB"])


class ValidacaoTests(APITestCase):
    def enviar(self, **dados):
        return self.client.post("/api/produtos/", dados, format="json")

    def test_nome_curto_e_preco_zero(self):
        r = self.enviar(nome="A", preco=0)
        self.assertEqual(r.status_code, 400)
        self.assertIn("nome", r.json())
        self.assertIn("preco", r.json())

    def test_nome_so_com_espacos(self):
        self.assertEqual(self.enviar(nome="   ", preco="10.00").status_code, 400)

    def test_preco_negativo(self):
        self.assertEqual(self.enviar(nome="Cabo", preco="-1.00").status_code, 400)

    def test_nome_e_limpo_antes_de_salvar(self):
        r = self.enviar(nome="  Cabo USB  ", preco="20.00")
        self.assertEqual((r.status_code, r.json()["nome"]), (201, "Cabo USB"))

    def test_put_invalido(self):
        p = Produto.objects.create(nome="Mouse", preco="50.00")
        r = self.client.put(f"/api/produtos/{p.id}/", {"nome": "A", "preco": "10.00"}, format="json")
        self.assertEqual(r.status_code, 400)


class PaginacaoTests(APITestCase):
    def setUp(self):
        Produto.objects.bulk_create(Produto(nome=f"Produto {i:02d}", preco=f"{i}.00") for i in range(1, 26))

    def get(self, consulta=""):
        return self.client.get(f"/api/produtos/?{consulta}")

    def test_formato_e_padrao(self):
        r = self.get().json()
        self.assertEqual((r["page"], r["page_size"], r["total_pages"], len(r["results"])), (1, 10, 3, 10))

    def test_segunda_pagina_com_page_size(self):
        r = self.get("page=2&page_size=20").json()
        self.assertEqual((r["page"], r["page_size"], r["total_pages"], len(r["results"])), (2, 20, 2, 5))

    def test_pagina_alem_do_limite_devolve_lista_vazia(self):
        r = self.get("page=999")
        self.assertEqual((r.status_code, r.json()["results"]), (200, []))

    def test_page_size_acima_de_100(self):
        self.assertEqual(self.get("page_size=101").status_code, 400)
        self.assertEqual(self.get("page_size=100").status_code, 200)

    def test_page_invalida(self):
        self.assertEqual(self.get("page=0").status_code, 400)
        self.assertEqual(self.get("page=abc").status_code, 400)

    def test_combina_com_busca_e_ordenacao(self):
        r = self.get("search=produto&ordering=-preco&page=1&page_size=5").json()
        self.assertEqual([p["nome"] for p in r["results"]][:2], ["Produto 25", "Produto 24"])
        self.assertEqual(r["total_pages"], 5)

    def test_filtro_e_aplicado_antes_da_paginacao(self):
        r = self.get("preco_minimo=21&page_size=2").json()
        self.assertEqual((r["total_pages"], len(r["results"])), (3, 2))

    def test_lista_vazia_tem_zero_paginas(self):
        r = self.get("search=inexistente").json()
        self.assertEqual((r["total_pages"], r["results"]), (0, []))
