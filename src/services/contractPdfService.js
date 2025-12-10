import { generateContractPDF } from '@/utils/contractPDFGenerator';
import imageService from './imageService';
import api from '@/utils/api';

const contractPdfService = {
  /**
   * Generate and upload signed contract PDF
   * @param {Object} contract - Contract data
   * @param {string} ownerSignature - Owner's signature (base64 data URL)
   * @param {string} tenantSignature - Tenant's signature (base64 data URL)
   * @returns {Promise<string>} URL of uploaded PDF
   */
  generateAndUploadSignedPdf: async (contract, ownerSignature = null, tenantSignature = null) => {
    try {
      console.log('📄 Generating signed contract PDF...');
      console.log('📝 Contract ID:', contract.id);
      console.log('✍️ Owner signature:', ownerSignature ? 'Yes' : 'No');
      console.log('✍️ Tenant signature:', tenantSignature ? 'Yes' : 'No');

      // Step 1: Generate PDF with signatures embedded (now async)
      const doc = await generateContractPDF(contract, ownerSignature, tenantSignature);
      
      // Step 2: Convert PDF to Blob
      const pdfBlob = doc.output('blob');
      console.log('📦 PDF Blob size:', pdfBlob.size, 'bytes');

      // Step 3: Create File object from Blob
      const contractFileName = `Contract-${contract.id?.slice(0, 8) || 'unknown'}-signed-${new Date().toISOString().split('T')[0]}.pdf`;
      const pdfFile = new File([pdfBlob], contractFileName, { type: 'application/pdf' });
      console.log('📎 PDF File created:', contractFileName);

      // Step 4: Upload PDF to server
      console.log('📤 Uploading signed PDF to server...');
      const pdfUrl = await imageService.upload(pdfFile);
      console.log('✅ PDF uploaded successfully:', pdfUrl);

      return pdfUrl;
    } catch (error) {
      console.error('❌ Error generating and uploading signed PDF:', error);
      throw error;
    }
  },

  /**
   * Save signed PDF URL to contract
   * This is currently a placeholder - backend endpoint needs to be implemented
   * @param {string} contractId - Contract ID
   * @param {string} pdfUrl - URL of signed PDF
   * @returns {Promise<any>} API response
   */
  saveSignedPdfUrl: async (contractId, pdfUrl) => {
    try {
      console.log('💾 Saving signed PDF URL to contract:', contractId);
      console.log('🔗 PDF URL:', pdfUrl);

      // TODO: Backend endpoint to save PDF URL needs to be implemented
      // For now, we just log the URL and return success
      // The PDF is already uploaded and accessible via the URL
      
      // Future implementation:
      // const response = await api.put(`/api/Contract/${contractId}/signed-pdf`, {
      //   signedPdfUrl: pdfUrl
      // });

      console.log('✅ Signed PDF uploaded successfully');
      console.log('📋 PDF can be accessed at:', pdfUrl);
      
      return { success: true, pdfUrl };
    } catch (error) {
      console.error('❌ Error saving signed PDF URL:', error);
      // Don't throw error - PDF is already uploaded, this is just metadata
      // The contract is still valid even if this fails
      console.warn('⚠️ Contract is signed but PDF URL not saved to database');
      return null;
    }
  },

  /**
   * Complete contract signing workflow with PDF generation
   * @param {Object} contract - Contract data
   * @param {string} tenantSignature - Tenant's signature (base64 data URL)
   * @param {string} ownerSignature - Owner's signature (base64 data URL, optional)
   * @returns {Promise<Object>} Result with signature URL and PDF URL
   */
  signContractWithPdf: async (contract, tenantSignature, ownerSignature = null) => {
    try {
      console.log('🔐 Starting contract signing workflow with PDF generation...');

      // Step 1: Generate and upload signed PDF
      const pdfUrl = await contractPdfService.generateAndUploadSignedPdf(
        contract,
        ownerSignature,
        tenantSignature
      );

      // Step 2: Save PDF URL to contract (optional, doesn't affect signing)
      await contractPdfService.saveSignedPdfUrl(contract.id, pdfUrl);

      return {
        pdfUrl,
        success: true
      };
    } catch (error) {
      console.error('❌ Error in signContractWithPdf:', error);
      throw error;
    }
  },

  /**
   * Download signed contract PDF
   * @param {Object} contract - Contract data
   * @param {string} ownerSignature - Owner's signature (base64 data URL)
   * @param {string} tenantSignature - Tenant's signature (base64 data URL)
   */
  downloadSignedPdf: async (contract, ownerSignature = null, tenantSignature = null) => {
    try {
      console.log('⬇️ Downloading signed contract PDF...');
      
      const doc = await generateContractPDF(contract, ownerSignature, tenantSignature);
      const fileName = `Contract-${contract.id?.slice(0, 8) || 'unknown'}-signed-${new Date().toISOString().split('T')[0]}.pdf`;
      
      doc.save(fileName);
      console.log('✅ PDF downloaded:', fileName);
    } catch (error) {
      console.error('❌ Error downloading PDF:', error);
      throw error;
    }
  },

  /**
   * Preview signed contract PDF in new window
   * @param {Object} contract - Contract data
   * @param {string} ownerSignature - Owner's signature (base64 data URL)
   * @param {string} tenantSignature - Tenant's signature (base64 data URL)
   */
  previewSignedPdf: async (contract, ownerSignature = null, tenantSignature = null) => {
    // Open window first to avoid popup blocker
    const newWindow = window.open('', '_blank');
    
    if (!newWindow) {
      notification.warning('Please allow popups to preview the contract PDF');
      return;
    }
    
    // Show loading state
    newWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Loading Contract PDF...</title>
        <style>
          body { 
            margin: 0; padding: 0; 
            display: flex; justify-content: center; align-items: center; 
            height: 100vh; font-family: Arial, sans-serif;
            background: #f5f5f5;
          }
          .loader { text-align: center; }
          .spinner { 
            width: 50px; height: 50px; 
            border: 5px solid #e0e0e0; 
            border-top: 5px solid #3b82f6; 
            border-radius: 50%; 
            animation: spin 1s linear infinite;
            margin: 0 auto 20px;
          }
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        </style>
      </head>
      <body>
        <div class="loader">
          <div class="spinner"></div>
          <p>Generating PDF, please wait...</p>
          <p style="font-size: 12px; color: #666;">Loading images may take a few seconds</p>
        </div>
      </body>
      </html>
    `);
    
    try {
      console.log('👁️ Previewing signed contract PDF...');
      
      const doc = await generateContractPDF(contract, ownerSignature, tenantSignature);
      const pdfDataUri = doc.output('datauristring');
      
      // Replace loading content with PDF
      newWindow.document.open();
      newWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Contract Preview - ${contract.id?.slice(0, 8) || 'Contract'}</title>
          <style>
            body { margin: 0; padding: 0; overflow: hidden; }
            iframe { width: 100%; height: 100vh; border: none; }
          </style>
        </head>
        <body>
          <iframe src='${pdfDataUri}'></iframe>
        </body>
        </html>
      `);
      newWindow.document.close();
    } catch (error) {
      console.error('❌ Error previewing PDF:', error);
      
      // Show error in the window
      newWindow.document.open();
      newWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Error - Contract PDF</title>
          <style>
            body { 
              margin: 0; padding: 40px; 
              font-family: Arial, sans-serif;
              background: #fef2f2;
              color: #991b1b;
            }
            h1 { color: #dc2626; }
            pre { 
              background: #fee2e2; 
              padding: 15px; 
              border-radius: 8px;
              overflow: auto;
            }
          </style>
        </head>
        <body>
          <h1>❌ Error Generating PDF</h1>
          <p>An error occurred while generating the contract PDF:</p>
          <pre>${error.message || error}</pre>
          <p>Please try again or contact support.</p>
        </body>
        </html>
      `);
      newWindow.document.close();
    }
  }
};

export default contractPdfService;
