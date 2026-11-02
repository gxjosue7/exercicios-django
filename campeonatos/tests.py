from datetime import date, datetime, timezone

from django.contrib.auth.models import User
from rest_framework.test import APITestCase

from .models import Campeonato, Partida, Time

HORA = datetime(2026, 12, 2, 15, tzinfo=timezone.utc)


class AuthTests(APITestCase):
    def setUp(self):
        User.objects.create_user("ana", password="senha123")

    def test_leitura_publica_escrita_protegida(self):
        self.assertEqual(self.client.get("/api/campeonatos/").status_code, 200)
        self.assertEqual(self.client.post("/api/campeonatos/", {}, format="json").status_code, 401)

    def test_login_e_uso_do_token(self):
        r = self.client.post("/api/auth/token/", {"username": "ana", "password": "senha123"}, format="json")
        self.assertEqual(r.status_code, 200)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {r.json()['access']}")
        # autenticado, passa da autenticação e cai na validação (400)
        self.assertEqual(self.client.post("/api/campeonatos/", {}, format="json").status_code, 400)

    def test_login_invalido(self):
        r = self.client.post("/api/auth/token/", {"username": "ana", "password": "errada"}, format="json")
        self.assertEqual(r.status_code, 401)


class RegrasTests(APITestCase):
    def setUp(self):
        self.client.force_authenticate(User.objects.create_user("tester", password="x"))
        self.camp = Campeonato.objects.create(
            nome="Copa", modalidade="Futsal", data_inicio=date(2026, 12, 1), data_fim=date(2026, 12, 20), max_times=2
        )
        self.a = Time.objects.create(nome="A", sigla="A", campeonato=self.camp)
        self.b = Time.objects.create(nome="B", sigla="B", campeonato=self.camp)

    def partida(self, **kw):
        dados = {"campeonato": self.camp.id, "mandante": self.a.id, "visitante": self.b.id, "data_hora": HORA.isoformat()}
        return self.client.post("/api/partidas/", {**dados, **kw}, format="json")

    def test_time_alem_do_limite(self):
        r = self.client.post("/api/times/", {"nome": "C", "sigla": "C", "campeonato": self.camp.id}, format="json")
        self.assertEqual(r.status_code, 400)

    def test_time_com_inscricoes_encerradas(self):
        self.camp.status, self.camp.max_times = "andamento", 5
        self.camp.save()
        r = self.client.post("/api/times/", {"nome": "C", "sigla": "C", "campeonato": self.camp.id}, format="json")
        self.assertEqual(r.status_code, 400)

    def test_partida_mandante_igual_visitante(self):
        self.assertEqual(self.partida(visitante=self.a.id).status_code, 400)

    def test_partida_time_de_outro_campeonato(self):
        outro = Campeonato.objects.create(
            nome="X", modalidade="F", data_inicio=date(2026, 12, 1), data_fim=date(2026, 12, 2), max_times=4
        )
        c = Time.objects.create(nome="C", sigla="C", campeonato=outro)
        self.assertEqual(self.partida(visitante=c.id).status_code, 400)

    def test_conflito_de_horario(self):
        self.assertEqual(self.partida().status_code, 201)
        self.assertEqual(self.partida().status_code, 400)

    def test_placar_so_uma_vez(self):
        pid = self.partida().json()["id"]
        url = f"/api/partidas/{pid}/registrar-placar/"
        r = self.client.post(url, {"gols_mandante": 2, "gols_visitante": 1}, format="json")
        self.assertEqual(r.status_code, 200)
        self.assertEqual(Partida.objects.get(pk=pid).status, "finalizada")
        r = self.client.post(url, {"gols_mandante": 0, "gols_visitante": 0}, format="json")
        self.assertEqual(r.status_code, 409)

    def test_placar_invalido(self):
        pid = self.partida().json()["id"]
        r = self.client.post(f"/api/partidas/{pid}/registrar-placar/", {"gols_mandante": -1, "gols_visitante": 0}, format="json")
        self.assertEqual(r.status_code, 400)

    def test_partida_agendada_nao_aceita_placar(self):
        self.assertEqual(self.partida(gols_mandante=1, gols_visitante=0).status_code, 400)

    def test_paginacao_busca_ordenacao_filtro(self):
        for i in range(12):
            Campeonato.objects.create(
                nome=f"Liga {i:02d}", modalidade="Futsal" if i % 2 else "Volei",
                data_inicio=date(2026, 12, 1), data_fim=date(2026, 12, 2), max_times=4,
            )
        # 13 campeonatos no total (1 do setUp)
        r = self.client.get("/api/campeonatos/").json()
        self.assertEqual((r["page"], r["page_size"], r["total_pages"], len(r["results"])), (1, 10, 2, 10))
        r = self.client.get("/api/campeonatos/?page=2&page_size=5").json()
        self.assertEqual((r["total_pages"], len(r["results"])), (3, 5))
        self.assertEqual(self.client.get("/api/campeonatos/?page=99").json()["results"], [])
        self.assertEqual(self.client.get("/api/campeonatos/?page_size=101").status_code, 400)
        self.assertEqual(self.client.get("/api/campeonatos/?page=0").status_code, 400)
        r = self.client.get("/api/campeonatos/?search=liga 11&ordering=-nome").json()
        self.assertEqual([c["nome"] for c in r["results"]], ["Liga 11"])
        r = self.client.get("/api/campeonatos/?modalidade=Volei&ordering=nome&page_size=100").json()
        self.assertEqual(len(r["results"]), 6)
        self.assertEqual(r["results"][0]["nome"], "Liga 00")

    def test_filtro_partida_por_time(self):
        self.partida()
        self.assertEqual(len(self.client.get(f"/api/partidas/?time={self.a.id}").json()["results"]), 1)
        self.assertEqual(len(self.client.get("/api/partidas/?status=finalizada").json()["results"]), 0)
        self.assertEqual(len(self.client.get("/api/partidas/?search=B").json()["results"]), 1)

    def test_docs(self):
        self.assertEqual(self.client.get("/api/docs/").status_code, 200)
        self.assertEqual(self.client.get("/api/schema/").status_code, 200)
