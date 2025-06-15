const https = require('https');

function submitBlastJob() {
  const data = JSON.stringify({
    sequence: "MVKVGVNGFGRIGRLVTRAAFNSGKVDIVAINDPFIDLNYMVYMFQYDSTHGKFHGTVKAENGKLVINGNPITIFQERDPSKIKWGDAGAEYYVVESTGVFTTMEKAGAHLQGGAKRVIISAPSADAPMFVMGVNHEKYDNSLKIISNASCINKCSLLKENLLGKTIV",
    algorithm: "blastp",
    evalue: 10,
    maxTargetSeqs: 10
  });

  const options = {
    hostname: 'hsndb-blast-backend.onrender.com',
    path: '/api/blast/submit',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  const req = https.request(options, (res) => {
    let responseData = '';

    res.on('data', (chunk) => {
      responseData += chunk;
    });

    res.on('end', () => {
      try {
        const result = JSON.parse(responseData);
        console.log('✅ BLAST job submitted:', result.jobId);
        
        // Check job status after a few seconds
        setTimeout(() => checkJobStatus(result.jobId), 5000);
      } catch (error) {
        console.log('Raw response:', responseData);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Request error:', error.message);
  });

  req.write(data);
  req.end();
}

function checkJobStatus(jobId) {
  const options = {
    hostname: 'hsndb-blast-backend.onrender.com',
    path: `/api/blast/status/${jobId}`,
    method: 'GET'
  };

  const req = https.request(options, (res) => {
    let responseData = '';

    res.on('data', (chunk) => {
      responseData += chunk;
    });

    res.on('end', () => {
      try {
        const result = JSON.parse(responseData);
        console.log('\n🔍 Job Status:', result.status);
        
        if (result.error) {
          console.log('❌ Error:', result.error);
        }
        
        if (result.status === 'running') {
          console.log('⏳ Job still running, checking again in 5 seconds...');
          setTimeout(() => checkJobStatus(jobId), 5000);
        } else if (result.status === 'completed') {
          console.log('✅ Job completed successfully!');
          console.log(`📊 Found ${result.results?.totalHits || 0} hits`);
        }
      } catch (error) {
        console.log('Raw response:', responseData);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Request error:', error.message);
  });

  req.end();
}

console.log('🚀 Testing BLAST backend after fixes...');
submitBlastJob();
