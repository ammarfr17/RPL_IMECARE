Small Express backend for the RPL_19_CARE project.

Endpoints:
- GET /api/complaints -> list all complaints
- GET /api/complaints?jenis=Kerusakan%20Fasilitas -> filter by jenis
- GET /api/complaints/:id -> get one
- POST /api/complaints -> create (JSON body: name,email,jenis,complaint,fileUrl)
- PUT /api/complaints/:id/status -> update status (JSON body: { status })

Run:
- npm install
- npm run dev
