// src/mocks/handlers.js
import { http, HttpResponse } from "msw";

export const handlers = [
  // CORE SERVICE — el que te está fallando ahora mismo
  http.get(
    "http://localhost:8080/api/core-service/profesionales/email/:email",
    ({ params }) => {
      return HttpResponse.json({
        idProfesional: 1,
        especialidad: "Podología",
        nombre: "Ludwig Ivan",
        apellidoPaterno: "Ortiz",
        apellidoMaterno: "Sierra",
        cedulaProfesional: "12345678",
        cedulaEspecializada: "POD-12345",
        institucion: "Instituto Tecnológico",
        telefono: "3531234567",
        email: params.email,
        activo: true,
      });
    },
  ),

  http.post(
    "http://localhost:8080/api/core-service/pacientes",
    async ({ request }) => {
      const paciente = await request.json();
      return HttpResponse.json(paciente);
    },
  ),

  http.get(
    "http://localhost:8080/api/core-service/pacientes/:curp",
    ({ params }) => {
      return HttpResponse.json({
        curp: params.curp,
        nombre: "ludwig",
        apellidoPaterno: "ortiz",
        apellidoMaterno: "sierra",
        fechaNacimiento: "2026-09-01",
        sexo: "MASCULINO",
        telefono: "+529876541553",
        domicilio: "FRANK MORENO",
      });
    },
  ),

  http.get("http://localhost:8080/api/core-service/pacientes", () => {
    return HttpResponse.json({
      content: [
        {
          curp: "OISL060304HMNRRDA2",
          nombre: "ludwig",
          apellidoPaterno: "ortiz",
          apellidoMaterno: "sierra",
          fechaNacimiento: "2026-09-01",
          sexo: "MASCULINO",
          telefono: "+529876541553",
          domicilio: "FRANK MORENO",
        },
      ],
      empty: false,
      first: true,
      last: true,
      number: 0,
      numberOfElements: 1,
      pageable: {
        offset: 0,
        pageNumber: 0,
        pageSize: 10,
        paged: true,
        sort: {
          empty: true,
          sorted: false,
          unsorted: true,
        },
        unpaged: false,
      },
      size: 10,
      sort: {
        empty: true,
        sorted: false,
        unsorted: true,
      },
      totalElements: 1,
      totalPages: 1,
    });
  }),

  http.post("http://localhost:8080/api/core-service/expedientes", () => {
    return HttpResponse.json({
      idPaciente: "OISL060304HMNRRDA2",
      numeroExpediente: "EXP-OISL060304HMNRRAD2",
      antecedentes: "TODOS LOS ANTECEDENTES",
      estado: "ACTIVO",
    });
  }),

  http.post(
    "http://localhost:8080/api/core-service/informes",
    ({ request }) => {
      const informe = {
        ...request.body,
        idInforme: "f9e43ba2-f875-4c20-9c70-3f5b02837bc3",
        fechaRegistro: "2026-08-19T07:23:07.326Z",
      };
      return HttpResponse.json(informe);
    },
  ),

  http.get(
    "http://localhost:8080/api/core-service/informes/paciente",
    ({ request }) => {
      const url = new URL(request.url);

      const idPaciente = url.searchParams.get("idPaciente");
      const page = url.searchParams.get("page");
      const size = url.searchParams.get("size");

      return HttpResponse.json({
        content: [
          {
            idInforme: "6ed778eb-04cb-4bc4-9907-c055ef3af209",
            idPaciente: idPaciente,
            idProfesional: 1,
            estadoGeneral: "TODOS LOS ESTADOS GENERALEs",
            pesoKg: 25.0,
            sintomas: "TODOS LOS SINTOMAS",
            descripcion: "",
            diagnostico: "TODOS LOS DIAGNOSTICOS",
            codigoCie10: "M79.67",
            tratamiento: "TODOS LOS TRATAMIENTOS",
            evolucion: "TODAS LAS EVOLUCIONES",
            observaciones: "TODAS LAS OBSERVACIONES",
            fechaRegistro: "2026-09-15T14:40:50.124Z",
          },
        ],
        empty: false,
        first: true,
        last: true,
        number: page,
        numberOfElements: 1,
        pageable: {
          offset: 0,
          pageNumber: page,
          pageSize: size,
          paged: true,
          sort: {
            empty: true,
            sorted: false,
            unsorted: true,
          },
          unpaged: false,
        },
        size: size,
        sort: {
          empty: true,
          sorted: false,
          unsorted: true,
        },
        totalElements: 1,
        totalPages: 1,
      });
    },
  ),

  http.post(
    "http://localhost:8080/api/core-service/analisis",
    ({ request }) => {
      return HttpResponse.json({
        ...request.body,
        idInforme: "f9e43ba2-f875-4c20-9c70-3f6b02837bc3",
        fechaRegistro: "2026-08-19T07:23:07.326Z",
        fechaActualizacion: "2026-08-19T07:23:07.326Z",
      });
    },
  ),

  http.get(
    "http://localhost:8080/api/core-service/analisis/informe/:idInforme",
    ({ params }) => {
      return HttpResponse.json([
        {
          idAnalisis: "43b3633a-a6d6-492e-b1d4-ce999ecc7339",
          idInforme: params.idInforme,
          pieType: "DERECHA",
          className: "CONCAVO",
          confidence: 98.67,
          fechaRegistro: "2026-09-15T14:40:50.557Z",
          fechaActualizacion: "2026-09-15T14:40:50.557Z",
        },
        {
          idAnalisis: "43ad2d36-bfd9-4a57-a4f3-00816f659df9",
          idInforme: params.idInforme,
          pieType: "IZQUIERDA",
          className: "CONCAVO",
          confidence: 99.36,
          fechaRegistro: "2026-09-15T14:40:50.858Z",
          fechaActualizacion: "2026-09-15T14:40:50.858Z",
        },
      ]);
    },
  ),

  http.post(
    "http://localhost:8080/api/core-service/documentos",
    ({ request }) => {
      return HttpResponse.json({
        ...request.body,
        idDocumento: "5b919198-4d52-4e96-991a-006b74541d8c",
      });
    },
  ),

  http.get(
    "http://localhost:8080/api/core-service/documentos/informe/:idInforme",
    ({ params }) => {
      return HttpResponse.json([
        {
          idDocumento: "a1743ebd-e53e-4a11-944b-8229670b7e79",
          idPaciente: "OISL060304HMNRRAD2",
          idProfesional: 1,
          idInforme: params.idInforme,
          idAnalisis: "43ad2d36-bfd9-4a57-a4f3-00816f659df9",
          storageUri:
            "https://document-dev.66096439001e5ca08a8c13ba61a2f3ec.r2.cloudflarestorage.com/clinical-documents/OISL060304HMNRRAD2/0e2a11ad-b36e-4fd3-aab1-311f4007ce04-RF000_46_flip_h_TTAO.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20260915T144057Z&X-Amz-SignedHeaders=content-type%3Bhost&X-Amz-Credential=3a81f62b24e4ca0b6353f7ee2a137afd%2F20260915%2Fauto%2Fs3%2Faws4_request&X-Amz-Expires=900&X-Amz-Signature=ef6246b55ede960aea3073f821409d271eb1b26c6fe7bae723f34bee7b21804d",
          storageKey:
            "clinical-documents/OISL060304HMNRRAD2/0e2a11ad-b36e-4fd3-aab1-311f4007ce04-RF000_46_flip_h_TTAO.png",
          nombreDocumento: "RF000_46_flip_h_TTAO.png",
          mimeType: "image/png",
          tamanoBytes: 111767,
          hashSha256:
            "365974f0b4e51038cf1036d5a01d9ba189bf9864aecf5d540d51aa967885d8aa",
          version: 1,
          fechaDocumento: "2024-09-26T21:53:01.000Z",
        },
        {
          idDocumento: "54c531c2-eaa5-4af3-9f2b-bec7c8bc1961",
          idPaciente: "OISL060304HMNRRAD2",
          idProfesional: 1,
          idInforme: params.idInforme,
          idAnalisis: "43b3633a-a6d6-492e-b1d4-ce999ecc7339",
          storageUri:
            "https://document-dev.66096439001e5ca08a8c13ba61a2f3ec.r2.cloudflarestorage.com/clinical-documents/OISL060304HMNRRAD2/21dec4a7-f81b-45a5-a8e1-7693a95f906d-RF000_46_flip_v_TTAO.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20260915T144057Z&X-Amz-SignedHeaders=content-type%3Bhost&X-Amz-Credential=3a81f62b24e4ca0b6353f7ee2a137afd%2F20260915%2Fauto%2Fs3%2Faws4_request&X-Amz-Expires=900&X-Amz-Signature=fdf316b0be0f200693cd11d14ce1a864727efdc546e37f4edfd29b913b50052d",
          storageKey:
            "clinical-documents/OISL060304HMNRRAD2/21dec4a7-f81b-45a5-a8e1-7693a95f906d-RF000_46_flip_v_TTAO.png",
          nombreDocumento: "RF000_46_flip_v_TTAO.png",
          mimeType: "image/png",
          tamanoBytes: 111664,
          hashSha256:
            "5515f9390a87e1845941d05da8a3b5329a36cb1cb3b8dec0a6ea7ce291c49f1b",
          version: 1,
          fechaDocumento: "2024-09-26T21:54:30.000Z",
        },
      ]);
    },
  ),
  // Simular upload a R2 (PUT con el binario)
  http.put("https://*.r2.cloudflarestorage.com/*", async ({ request }) => {
    console.log(
      "Upload simulado a R2, tamaño:",
      request.headers.get("content-length"),
    );
    return new HttpResponse(null, { status: 200 });
  }),

  // Simular descarga desde R2 (GET)
  http.get("https://*.r2.cloudflarestorage.com/*", () => {
    return new HttpResponse("contenido-falso-del-archivo", {
      status: 200,
      headers: { "Content-Type": "application/pdf" },
    });
  }),

  http.post("http://localhost:8080/api/ia-service/predict", () => {
    return HttpResponse.json({
      file_name: "",
      predicted_class: 0,
      class_name: "CONCAVO",
      confidence: 99.36,
      probabilities: {
        CONCAVO: 99.36,
        PLANO: 0.2,
        NORMAL: 0.44,
      },
      timestamp: "2026-09-16T08:29:36.835395",
    });
  }),

  http.post(
    "http://localhost:8080/api/document-service/documents/download-url",
    async ({ request }) => {
      const body = await request.json();
      return HttpResponse.json({
        storageKey: body.storageKey,
        downloadUrl: "https://prueba.com",
        expiresInSeconds: 900,
      });
    },
  ),

  http.post(
    "http://localhost:8080/api/document-service/documents/upload-url",
    () => {
      return HttpResponse("contenido-falso-del-archivo", {
        status: 200,
        headers: { "Content-Type": "application/pdf" },
      });
    },
  ),

  http.get("https://prueba.com", () => {
    return HttpResponse.json({});
  }),
];
