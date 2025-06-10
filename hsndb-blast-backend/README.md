
# HSNDB BLAST Backend

A robust BLAST search backend for the HSNDB (S-nitrosylated proteins database) built with Node.js and NCBI BLAST+.

## Features

- **Multiple BLAST Algorithms**: BLASTP, BLASTN, BLASTX, TBLASTN, TBLASTX
- **Asynchronous Processing**: Non-blocking job queue with real-time status updates
- **Automatic Database Management**: Auto-creates BLAST database from FASTA files
- **Robust Error Handling**: Comprehensive validation and error recovery
- **RESTful API**: Clean API endpoints for web integration
- **Job Management**: Automatic cleanup of old jobs and temporary files

## Prerequisites

1. **Node.js** (v16 or higher)
2. **NCBI BLAST+** installed and accessible
3. **FASTA file** with protein sequences in the root directory

## Installation

1. Install dependencies:
```bash
npm install
```

2. Configure BLAST+ path in `config.js` if needed:
```javascript
BLAST_BIN_PATH: "C:\\Program Files\\NCBI\\blast-2.16.0+\\bin\\"
```

3. Place your FASTA file as `sequences.fasta` in the parent directory

## Usage

### Start the server:
```bash
npm start
# or
node start.js
```

### Development mode:
```bash
npm run dev
```

### API Endpoints

- `GET /api/health` - Server health check
- `GET /api/database/info` - Database information
- `POST /api/blast/submit` - Submit BLAST search
- `GET /api/blast/status/:jobId` - Get job status
- `GET /api/blast/results/:jobId` - Get search results
- `GET /api/blast/jobs` - List active jobs

### Example BLAST Search:
```javascript
// Submit search
const response = await fetch('http://localhost:3001/api/blast/submit', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sequence: 'MVKVGVNGFGRIGRLVTRAAF...',
    algorithm: 'blastp',
    evalue: 10,
    maxTargetSeqs: 500
  })
});

const { jobId } = await response.json();

// Check status
const statusResponse = await fetch(`http://localhost:3001/api/blast/status/${jobId}`);
const status = await statusResponse.json();

// Get results when completed
if (status.status === 'completed') {
  const resultsResponse = await fetch(`http://localhost:3001/api/blast/results/${jobId}`);
  const results = await resultsResponse.json();
}
```

## Configuration

Edit `config.js` to customize:

- BLAST+ binary path
- Database location
- Server port
- Job cleanup intervals
- Validation parameters

## Database Management

The server automatically:
1. Checks for existing BLAST database
2. Creates new database from FASTA file if needed
3. Validates database integrity

## Error Handling

- Input validation for sequences and parameters
- Automatic retry logic for transient failures
- Graceful degradation for missing files
- Comprehensive logging

## Production Deployment

1. Set environment variables:
```bash
export NODE_ENV=production
export PORT=3001
export BLAST_BIN_PATH=/usr/local/bin/
```

2. Use process manager (PM2 recommended):
```bash
pm2 start server.js --name "hsndb-blast"
```

3. Configure reverse proxy (nginx) for SSL and load balancing

## Troubleshooting

### Common Issues:

1. **BLAST+ not found**: Update `BLAST_BIN_PATH` in config.js
2. **Database creation fails**: Check FASTA file format and permissions
3. **Jobs failing**: Verify BLAST+ installation and database integrity
4. **Memory issues**: Increase Node.js memory limit: `node --max-old-space-size=4096 server.js`

### Logs:

Check console output for detailed error messages and job status updates.

## API Documentation

### Submit BLAST Search
```
POST /api/blast/submit
Content-Type: application/json

{
  "sequence": "MVKVGVNGFGRIGRLVTRAAF...",
  "algorithm": "blastp",
  "evalue": 10,
  "maxTargetSeqs": 500,
  "matrix": "BLOSUM62",
  "wordSize": 3,
  "gapOpen": 11,
  "gapExtend": 1
}

Response:
{
  "jobId": "uuid-string",
  "message": "BLAST search submitted successfully",
  "estimatedTime": "5-30 seconds"
}
```

### Job Status
```
GET /api/blast/status/:jobId

Response:
{
  "jobId": "uuid-string",
  "status": "pending|running|completed|failed",
  "progress": 75,
  "estimatedTimeRemaining": 10,
  "startTime": 1640995200000
}
```

### Results
```
GET /api/blast/results/:jobId

Response:
{
  "jobId": "uuid-string",
  "queryLength": 300,
  "databaseSize": 4533,
  "totalHits": 25,
  "hits": [...],
  "statistics": {...},
  "executionTime": 15
}
```
