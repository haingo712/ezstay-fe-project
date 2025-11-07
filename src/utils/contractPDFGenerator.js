import { jsPDF } from "jspdf";
import "jspdf-autotable";

/**
 * Generate a complete contract PDF with all terms, conditions, and digital signatures
 * @param {Object} contract - Contract data
 * @param {string} ownerSignature - Owner's digital signature (base64)
 * @param {string} tenantSignature - Tenant's digital signature (base64)
 * @returns {jsPDF} PDF document
 */
export function generateContractPDF(contract, ownerSignature = null, tenantSignature = null) {
  console.log('📄 PDF Generator - Received contract data:', contract);
  console.log('📄 PDF Generator - Contract keys:', Object.keys(contract));
  console.log('📄 PDF Generator - Identity Profiles:', contract.identityProfiles || contract.IdentityProfiles);
  console.log('📄 PDF Generator - Room Details:', contract.roomDetails || contract.RoomDetails);
  console.log('📄 PDF Generator - Electricity Reading:', contract.electricityReading || contract.ElectricityReading);
  console.log('📄 PDF Generator - Water Reading:', contract.waterReading || contract.WaterReading);
  
  const doc = new jsPDF();
  
  // Get tenant information from identity profiles (use IdentityProfiles for PascalCase or identityProfiles for camelCase)
  const identityProfiles = contract.IdentityProfiles || contract.identityProfiles || [];
  console.log('👤 Identity Profiles Array Length:', identityProfiles.length);
  
  if (identityProfiles.length === 0) {
    console.warn('⚠️ WARNING: No identity profiles found in contract!');
    console.warn('⚠️ Contract may not have tenant information populated.');
    console.warn('⚠️ Please ensure contract.identityProfiles or contract.IdentityProfiles is populated.');
  }
  
  const tenant = identityProfiles[0] || {};
  console.log('👤 Primary Tenant:', tenant);
  
  if (Object.keys(tenant).length === 0) {
    console.error('❌ ERROR: Tenant object is empty! Party B will show N/A values.');
  }
  
  // Get dates with proper validation
  const parseDate = (dateStr) => {
    if (!dateStr) return null;
    try {
      const date = new Date(dateStr);
      // Check if date is valid
      return isNaN(date.getTime()) ? null : date;
    } catch (e) {
      console.error('Error parsing date:', dateStr, e);
      return null;
    }
  };
  
  const checkinDate = parseDate(contract.checkinDate || contract.CheckinDate) || new Date();
  const checkoutDate = parseDate(contract.checkoutDate || contract.CheckoutDate) || new Date();
  const createdAt = parseDate(contract.createdAt || contract.CreatedAt);
  const updatedAt = parseDate(contract.updatedAt || contract.UpdatedAt);
  const canceledAt = parseDate(contract.canceledAt || contract.CanceledAt);
  
  // Get room information
  const roomDetails = contract.roomDetails || contract.RoomDetails || {};
  const roomName = contract.roomName || roomDetails.name || roomDetails.Name || 'N/A';
  const roomAddress = roomDetails.address || roomDetails.Address || 'N/A';
  const roomArea = roomDetails.area || roomDetails.Area || 'N/A';
  const maxOccupants = roomDetails.maxOccupants || roomDetails.MaxOccupants || contract.numberOfOccupants || contract.NumberOfOccupants || 'N/A';
  
  // Get contract pricing (use RoomPrice from contract, NOT from roomDetails)
  const monthlyRent = contract.roomPrice || contract.RoomPrice || roomDetails.price || roomDetails.Price || 0;
  const depositAmount = contract.depositAmount || contract.DepositAmount || 0;
  
  // Get occupant information
  const numberOfOccupants = contract.numberOfOccupants || contract.NumberOfOccupants || identityProfiles.length || 1;
  
  // Get utility readings if available
  const electricityReading = contract.electricityReading || contract.ElectricityReading || null;
  const waterReading = contract.waterReading || contract.WaterReading || null;
  
  // Header - Vietnam Republic format
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('SOCIALIST REPUBLIC OF VIETNAM', 105, 20, { align: 'center' });
  doc.text('Independence – Freedom – Happiness', 105, 30, { align: 'center' });
  
  // Divider line
  doc.line(75, 35, 135, 35);
  
  // Contract title
  doc.setFontSize(18);
  doc.text('HOUSE LEASE CONTRACT', 105, 50, { align: 'center' });
  
  // Contract basic info
  doc.setFontSize(12);
  doc.setFont(undefined, 'normal');
  let yPos = 70;
  
  doc.text(`Contract No: ${contract.id?.slice(0, 8) || 'N/A'}`, 20, yPos);
  yPos += 10;
  doc.text(`Created Date: ${createdAt ? createdAt.toLocaleDateString('en-GB') : 'N/A'}`, 20, yPos);
  yPos += 7;
  if (updatedAt && updatedAt.getTime() !== createdAt?.getTime()) {
    doc.text(`Last Updated: ${updatedAt.toLocaleDateString('en-GB')}`, 20, yPos);
    yPos += 7;
  }
  const contractStatus = contract.contractStatus || contract.ContractStatus || 'N/A';
  doc.text(`Status: ${contractStatus}`, 20, yPos);
  yPos += 7;
  if (contractStatus === 'Cancelled' && canceledAt) {
    doc.setTextColor(255, 0, 0);
    doc.text(`Canceled Date: ${canceledAt.toLocaleDateString('en-GB')}`, 20, yPos);
    yPos += 7;
    if (contract.reason || contract.Reason) {
      doc.text(`Reason: ${contract.reason || contract.Reason}`, 20, yPos);
      yPos += 7;
    }
    doc.setTextColor(0, 0, 0);
  }
  yPos += 8;
  
  // Parties information
  doc.setFont(undefined, 'bold');
  doc.text('THE CONTRACTING PARTIES:', 20, yPos);
  yPos += 10;
  
  doc.setFont(undefined, 'normal');
  doc.text('Party A (Lessor): EZStay Property Management', 20, yPos);
  yPos += 7;
  doc.text('Address: Ho Chi Minh City, Vietnam', 20, yPos);
  yPos += 7;
  doc.text('Phone: +84 xxx xxx xxx', 20, yPos);
  yPos += 7;
  doc.text(`Owner ID: ${contract.ownerId?.slice(0, 8) || contract.OwnerId?.slice(0, 8) || 'N/A'}`, 20, yPos);
  yPos += 10;
  
  // Party B - Check if tenant data exists
  const hasTenantData = Object.keys(tenant).length > 0;
  
  // If no tenant data, show warning
  if (!hasTenantData) {
    doc.setFontSize(9);
    doc.setTextColor(200, 0, 0);
    doc.setFont(undefined, 'italic');
    doc.text('Note: Tenant information will be completed upon signing', 20, yPos);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    yPos += 7;
  }
  
  const tenantName = tenant.fullName || tenant.FullName || (hasTenantData ? 'N/A' : '[To be determined]');
  const tenantAddress = tenant.address || tenant.Address || (hasTenantData ? 'N/A' : '[To be provided]');
  const tenantPhone = tenant.phoneNumber || tenant.PhoneNumber || (hasTenantData ? 'N/A' : '[To be provided]');
  const tenantEmail = tenant.email || tenant.Email || (hasTenantData ? 'N/A' : '[To be provided]');
  const tenantCitizenId = tenant.citizenIdNumber || tenant.CitizenIdNumber || (hasTenantData ? 'N/A' : '[To be provided]');
  
  doc.text(`Party B (Lessee): ${tenantName}`, 20, yPos);
  yPos += 7;
  doc.text(`Address: ${tenantAddress}`, 20, yPos);
  yPos += 7;
  // Show province and ward if available
  const provinceName = tenant.provinceName || tenant.ProvinceName;
  const wardName = tenant.wardName || tenant.WardName;
  if (provinceName || wardName) {
    doc.text(`Location: ${wardName ? wardName + ', ' : ''}${provinceName || ''}`, 20, yPos);
    yPos += 7;
  }
  doc.text(`Phone: ${tenantPhone}`, 20, yPos);
  yPos += 7;
  doc.text(`Email: ${tenantEmail}`, 20, yPos);
  yPos += 7;
  doc.text(`Citizen ID: ${tenantCitizenId}`, 20, yPos);
  yPos += 7;
  const citizenIdIssuedDate = tenant.citizenIdIssuedDate || tenant.CitizenIdIssuedDate;
  const citizenIdIssuedPlace = tenant.citizenIdIssuedPlace || tenant.CitizenIdIssuedPlace;
  if (citizenIdIssuedDate || citizenIdIssuedPlace) {
    doc.text(`ID Issued: ${citizenIdIssuedDate ? new Date(citizenIdIssuedDate).toLocaleDateString('en-GB') : 'N/A'} at ${citizenIdIssuedPlace || 'N/A'}`, 20, yPos);
    yPos += 7;
  }
  const dobDate = tenant.dateOfBirth || tenant.DateOfBirth;
  if (dobDate) {
    doc.text(`Date of Birth: ${new Date(dobDate).toLocaleDateString('en-GB')}`, 20, yPos);
    yPos += 7;
  }
  const isSigner = tenant.isSigner || tenant.IsSigner;
  if (isSigner) {
    doc.setFont(undefined, 'bold');
    doc.text('(Primary Signer)', 20, yPos);
    doc.setFont(undefined, 'normal');
    yPos += 7;
  }
  yPos += 8;
  
  // Introduction
  const introText = 'After discussion and mutual understanding, the two parties have agreed to enter into this house lease contract with the following terms and conditions, which both parties pledge to strictly comply with:';
  const introLines = doc.splitTextToSize(introText, 170);
  doc.text(introLines, 20, yPos);
  yPos += introLines.length * 7 + 10;
  
  // Article 1: The House for Lease
  doc.setFont(undefined, 'bold');
  doc.text('ARTICLE 1: THE HOUSE FOR LEASE, PURPOSES OF USE', 20, yPos);
  yPos += 10;
  
  doc.setFont(undefined, 'normal');
  const roomDesc = roomDetails.description || roomDetails.Description || '';
  const article1Text = `Party A agrees to lease to Party B the room "${roomName}" located at ${roomAddress}, managed by EZStay system. The room has an area of ${roomArea} m² and is designed to accommodate a maximum of ${maxOccupants} occupants. ${roomDesc ? 'Room description: ' + roomDesc + '. ' : ''}The room is fully furnished with essential equipment and facilities ready for residential use. All equipment and facilities are specifically listed and confirmed in the minutes of handover between the two parties. The leased premises shall be used solely for residential purposes and not for any illegal activities or commercial purposes without prior written consent from Party A.`;
  const article1Lines = doc.splitTextToSize(article1Text, 170);
  doc.text(article1Lines, 20, yPos);
  yPos += article1Lines.length * 7 + 10;
  
  // Article 2: Duration of the Lease
  doc.setFont(undefined, 'bold');
  doc.text('ARTICLE 2: DURATION OF THE LEASE', 20, yPos);
  yPos += 10;
  
  doc.setFont(undefined, 'normal');
  const durationMonths = Math.round((checkoutDate - checkinDate) / (1000 * 60 * 60 * 24 * 30));
  const article2Text = `Duration of the lease: ${durationMonths} months, commencing on ${checkinDate.toLocaleDateString('en-GB')} and ending on ${checkoutDate.toLocaleDateString('en-GB')}. Upon expiration of this term, if both parties wish to continue the lease relationship, they shall negotiate the rental fee and other terms for a new lease contract. Party B will be given priority to sign a new contract for the same premises, provided that Party B has fulfilled all obligations under this contract and there is no violation of the terms herein. Either party wishing to extend must notify the other party in writing at least thirty (30) days prior to the expiration date.`;
  const article2Lines = doc.splitTextToSize(article2Text, 170);
  doc.text(article2Lines, 20, yPos);
  yPos += article2Lines.length * 7 + 10;
  
  // Check if we need a new page
  if (yPos > 250) {
    doc.addPage();
    yPos = 20;
  }
  
  // Article 3: Rental Fee and Payment
  doc.setFont(undefined, 'bold');
  doc.text('ARTICLE 3: RENTAL FEE, SECURITY DEPOSIT AND PAYMENT METHOD', 20, yPos);
  yPos += 10;
  
  doc.setFont(undefined, 'normal');
  // Display full pricing information
  const article3Text = `Monthly rental fee: ${monthlyRent.toLocaleString()} VND/month. Room area: ${roomArea} m². Maximum occupants: ${maxOccupants} persons. Current number of occupants: ${numberOfOccupants} person(s). Party B shall pay Party A a security deposit of ${depositAmount.toLocaleString()} VND upon signing this contract. This deposit serves as security for Party A against any damages to the property or unpaid bills. The deposit will be returned to Party B within fifteen (15) days after the contract termination, after deducting any outstanding electricity, water, and other utility bills, as well as costs for repairs of damages (if any) caused by Party B during the lease period. Payment method: Party B shall pay the monthly rent to Party A not later than the 5th day of each month. Payment can be made via bank transfer to Party A's designated account or in cash with a receipt. Late payment will incur a penalty of 0.5% of the monthly rent for each day of delay.`;
  const article3Lines = doc.splitTextToSize(article3Text, 170);
  doc.text(article3Lines, 20, yPos);
  yPos += article3Lines.length * 7 + 10;

  // Check if we need a new page
  if (yPos > 250) {
    doc.addPage();
    yPos = 20;
  }
  
  // Article 4: Utilities and Additional Services
  doc.setFont(undefined, 'bold');
  doc.text('ARTICLE 4: UTILITIES AND ADDITIONAL SERVICES', 20, yPos);
  yPos += 10;
  
  doc.setFont(undefined, 'normal');
  let utilityInfo = '';
  if (electricityReading || waterReading) {
    utilityInfo = '\n\nINITIAL METER READINGS:\n';
    if (electricityReading) {
      const elecIndex = electricityReading.currentIndex || electricityReading.CurrentIndex || 0;
      const elecPrevIndex = electricityReading.previousIndex || electricityReading.PreviousIndex || 0;
      const elecPrice = electricityReading.price || electricityReading.Price || 0;
      const elecDate = electricityReading.readingDate || electricityReading.ReadingDate;
      const elecConsumption = electricityReading.consumption || electricityReading.Consumption || (elecIndex - elecPrevIndex);
      const elecTotal = electricityReading.total || electricityReading.Total || (elecConsumption * elecPrice);
      const elecNote = electricityReading.note || electricityReading.Note;
      utilityInfo += `- Electricity: ${elecIndex} kWh (Previous: ${elecPrevIndex} kWh, Consumption: ${elecConsumption} kWh)\n`;
      utilityInfo += `  Rate: ${elecPrice.toLocaleString()} VND/kWh, Total: ${elecTotal.toLocaleString()} VND\n`;
      utilityInfo += `  Reading date: ${elecDate ? new Date(elecDate).toLocaleDateString('en-GB') : 'N/A'}\n`;
      if (elecNote && elecNote.trim()) {
        utilityInfo += `  Note: ${elecNote}\n`;
      }
    }
    if (waterReading) {
      const waterIndex = waterReading.currentIndex || waterReading.CurrentIndex || 0;
      const waterPrevIndex = waterReading.previousIndex || waterReading.PreviousIndex || 0;
      const waterPrice = waterReading.price || waterReading.Price || 0;
      const waterDate = waterReading.readingDate || waterReading.ReadingDate;
      const waterConsumption = waterReading.consumption || waterReading.Consumption || (waterIndex - waterPrevIndex);
      const waterTotal = waterReading.total || waterReading.Total || (waterConsumption * waterPrice);
      const waterNote = waterReading.note || waterReading.Note;
      utilityInfo += `- Water: ${waterIndex} m³ (Previous: ${waterPrevIndex} m³, Consumption: ${waterConsumption} m³)\n`;
      utilityInfo += `  Rate: ${waterPrice.toLocaleString()} VND/m³, Total: ${waterTotal.toLocaleString()} VND\n`;
      utilityInfo += `  Reading date: ${waterDate ? new Date(waterDate).toLocaleDateString('en-GB') : 'N/A'}\n`;
      if (waterNote && waterNote.trim()) {
        utilityInfo += `  Note: ${waterNote}\n`;
      }
    }
  }
  const article4Text = `Party B shall be responsible for paying all utility costs including electricity, water, internet, and any other services used during the lease term. Utility charges shall be calculated based on actual consumption according to the meter readings. The cost per unit for electricity and water will be as follows:\n- Electricity: As per the current rate set by EVN (Vietnam Electricity) or as agreed by both parties\n- Water: As per the current rate set by the local water supply company or as agreed by both parties${utilityInfo}\n\nParty B must ensure timely payment of all utility bills. Failure to pay utility bills may result in disconnection of services, for which Party A shall not be held responsible. Party B shall also be responsible for maintaining the cleanliness of the leased premises and common areas.`;
  const article4Lines = doc.splitTextToSize(article4Text, 170);
  doc.text(article4Lines, 20, yPos);
  yPos += article4Lines.length * 7 + 10;

  // Check if we need a new page
  if (yPos > 250) {
    doc.addPage();
    yPos = 20;
  }

  // Article 5: Rights and Obligations of Party A
  doc.setFont(undefined, 'bold');
  doc.text('ARTICLE 5: RIGHTS AND OBLIGATIONS OF PARTY A (LESSOR)', 20, yPos);
  yPos += 10;
  
  doc.setFont(undefined, 'normal');
  doc.text('1/ Rights of Party A:', 20, yPos);
  yPos += 7;
  
  const partyARights = [
    'To receive the full rental fee on time as agreed in Article 3.',
    'To inspect the leased premises with prior notice to ensure compliance with the contract terms.',
    'To request Party B to repair or compensate for any damages caused by Party B.',
    'To terminate the contract immediately if Party B violates any material terms of this contract.',
    'To increase the rental fee with 60 days prior written notice, but not more than once per year.'
  ];
  
  partyARights.forEach(right => {
    const rightLines = doc.splitTextToSize(right, 165);
    doc.text(rightLines, 25, yPos);
    yPos += rightLines.length * 7 + 3;
  });
  yPos += 5;
  
  doc.text('2/ Obligations of Party A:', 20, yPos);
  yPos += 7;
  
  const partyAObligations = [
    'To ensure that the house is legally owned by Party A and Party A has full rights to lease it.',
    'To hand over the house and all equipment and facilities to Party B in good working condition on the effective date of the contract.',
    'To provide Party B with necessary documents for temporary residence registration if requested.',
    'To ensure Party B\'s full and exclusive use rights of the leased premises during the lease term.',
    'To maintain the structural integrity of the building and conduct necessary major repairs (not caused by Party B).',
    'Not to interfere with Party B\'s peaceful enjoyment of the premises, except as permitted by this contract.',
    'To comply with the rental fee agreement during the lease term, except as provided in Article 5.1.5.',
    'If terminating the contract before its expiration without cause, to return the security deposit and compensate Party B an amount equal to one month\'s rent.',
    'To notify Party B at least sixty (60) days before the contract expiration regarding renewal or termination.'
  ];
  
  partyAObligations.forEach(obligation => {
    const obligationLines = doc.splitTextToSize(obligation, 165);
    doc.text(obligationLines, 25, yPos);
    yPos += obligationLines.length * 7 + 3;
  });
  yPos += 10;

  // Check if we need a new page
  if (yPos > 240) {
    doc.addPage();
    yPos = 20;
  }

  // Article 6: Rights and Obligations of Party B
  doc.setFont(undefined, 'bold');
  doc.text('ARTICLE 6: RIGHTS AND OBLIGATIONS OF PARTY B (LESSEE)', 20, yPos);
  yPos += 10;
  
  doc.setFont(undefined, 'normal');
  doc.text('1/ Rights of Party B:', 20, yPos);
  yPos += 7;
  
  const partyBRights = [
    'To use the leased premises fully and exclusively during the lease term.',
    'To receive assistance from Party A for temporary residence registration.',
    'To request Party A to conduct necessary major repairs (not caused by Party B).',
    'To sublet the premises with prior written consent from Party A.',
    'To have peaceful and quiet enjoyment of the premises without unwarranted intrusion from Party A.',
    'To terminate the contract early with 60 days written notice and forfeiture of the security deposit.'
  ];
  
  partyBRights.forEach(right => {
    const rightLines = doc.splitTextToSize(right, 165);
    doc.text(rightLines, 25, yPos);
    yPos += rightLines.length * 7 + 3;
  });
  yPos += 5;

  doc.text('2/ Obligations of Party B:', 20, yPos);
  yPos += 7;
  
  const partyBObligations = [
    'To use the house for residential purposes only, not for illegal or commercial activities.',
    'To pay the rental fee on time according to the agreed method and amount.',
    'To pay all utility costs (electricity, water, internet, etc.) on time as required.',
    'To maintain the leased premises in good condition and conduct minor repairs at own expense.',
    'To compensate for any damage or loss to the property beyond normal wear and tear.',
    'Not to make structural changes or major alterations without written consent from Party A.',
    'To comply with all building rules, regulations, and community standards.',
    'To return the leased premises to Party A in the same condition as received (normal wear and tear excepted) within seven (7) days after contract termination.',
    'To be fully responsible under law for all activities conducted on the leased premises.',
    'Not to engage in or allow any illegal activities, including but not limited to: drug use, gambling, prostitution, or harboring prohibited items.',
    'Not to disturb other residents or neighbors with excessive noise or improper behavior.',
    'To obtain written permission from Party A before keeping pets on the premises.',
    'To allow Party A or authorized representatives to inspect the premises with reasonable notice (at least 24 hours).',
    'To maintain adequate insurance for personal belongings and third-party liability.',
    'To notify Party A immediately of any damages, defects, or necessary repairs to the premises.',
    'Not to assign or transfer this lease agreement without written consent from Party A.'
  ];
  
  partyBObligations.forEach(obligation => {
    if (yPos > 260) {
      doc.addPage();
      yPos = 20;
    }
    const obligationLines = doc.splitTextToSize(obligation, 165);
    doc.text(obligationLines, 25, yPos);
    yPos += obligationLines.length * 7 + 3;
  });
  yPos += 10;

  // Check if we need a new page
  if (yPos > 220) {
    doc.addPage();
    yPos = 20;
  }

  // Article 7: Security and Safety
  doc.setFont(undefined, 'bold');
  doc.text('ARTICLE 7: SECURITY, SAFETY, AND FIRE PREVENTION', 20, yPos);
  yPos += 10;
  
  doc.setFont(undefined, 'normal');
  const article7Clauses = [
    'Party B must strictly comply with fire prevention and fighting regulations. Any use of flammable or explosive materials is strictly prohibited.',
    'Party B is responsible for ensuring security of the leased premises, including locking doors and windows when leaving.',
    'Party B must not overload electrical systems and must use electrical appliances properly and safely.',
    'In case of fire, Party B must immediately notify relevant authorities and Party A, and take necessary measures to prevent fire spread.',
    'Party B is liable for any damages caused by violations of fire safety or security regulations.',
    'Party A shall provide basic fire safety equipment (fire extinguisher, smoke detector) and ensure they are in working condition.',
    'Party B must maintain and properly use all provided safety equipment and notify Party A if replacement is needed.'
  ];
  
  article7Clauses.forEach(clause => {
    const clauseLines = doc.splitTextToSize(clause, 165);
    doc.text(clauseLines, 25, yPos);
    yPos += clauseLines.length * 7 + 3;
  });
  yPos += 10;

  // Check if we need a new page
  if (yPos > 230) {
    doc.addPage();
    yPos = 20;
  }

  // Article 8: Privacy and Data Protection
  doc.setFont(undefined, 'bold');
  doc.text('ARTICLE 8: PRIVACY AND DATA PROTECTION', 20, yPos);
  yPos += 10;
  
  doc.setFont(undefined, 'normal');
  const article8Text = 'Both parties agree to protect each other\'s personal information and shall not disclose such information to third parties without consent, except as required by law. Party A shall maintain confidentiality of Party B\'s personal data collected during the lease term. Party B consents to Party A collecting and processing personal information solely for the purpose of executing this contract and complying with legal requirements. All personal data shall be handled in accordance with applicable data protection laws and regulations.';
  const article8Lines = doc.splitTextToSize(article8Text, 170);
  doc.text(article8Lines, 20, yPos);
  yPos += article8Lines.length * 7 + 10;

  // Article 9: Maintenance and Repairs
  doc.setFont(undefined, 'bold');
  doc.text('ARTICLE 9: MAINTENANCE AND REPAIRS', 20, yPos);
  yPos += 10;
  
  doc.setFont(undefined, 'normal');
  const article9Text = 'Party A shall be responsible for major structural repairs and maintenance of the building, including roof, walls, foundation, and building systems (plumbing, electrical mains). Party B shall be responsible for minor repairs and day-to-day maintenance, including but not limited to: replacement of light bulbs, minor plumbing repairs, cleaning, and general upkeep. Party B must report any defects or damages to Party A within 48 hours of discovery. Party A shall conduct repairs within a reasonable timeframe (typically 7-14 days for non-emergency repairs). For emergency repairs (water leaks, electrical hazards, broken locks), Party A must respond within 24 hours.';
  const article9Lines = doc.splitTextToSize(article9Text, 170);
  doc.text(article9Lines, 20, yPos);
  yPos += article9Lines.length * 7 + 10;

  // Check if we need a new page
  if (yPos > 210) {
    doc.addPage();
    yPos = 20;
  }

  // Article 10: Dispute Resolution
  doc.setFont(undefined, 'bold');
  doc.text('ARTICLE 10: DISPUTE RESOLUTION', 20, yPos);
  yPos += 10;
  
  doc.setFont(undefined, 'normal');
  const article10Text = 'Any disputes arising during the implementation of this contract shall be resolved through negotiation and mediation between the two parties in the spirit of cooperation and mutual understanding. If negotiations fail, the parties may seek assistance from local authorities or relevant government agencies for mediation. If mediation is unsuccessful, either party may bring the dispute to the competent People\'s Court in accordance with Vietnamese law. The governing law for this contract shall be the laws of the Socialist Republic of Vietnam.';
  const article10Lines = doc.splitTextToSize(article10Text, 170);
  doc.text(article10Lines, 20, yPos);
  yPos += article10Lines.length * 7 + 10;

  // Article 11: Force Majeure
  doc.setFont(undefined, 'bold');
  doc.text('ARTICLE 11: FORCE MAJEURE', 20, yPos);
  yPos += 10;
  
  doc.setFont(undefined, 'normal');
  const forceMajeureText = 'Force majeure circumstances are defined as events beyond the reasonable control of either party, including but not limited to: natural disasters (earthquakes, floods, typhoons, fires), war, civil unrest, riots, epidemics or pandemics, government orders or regulations, terrorism, or other unforeseen events that prevent contract performance. In case of force majeure:';
  const forceMajeureLines = doc.splitTextToSize(forceMajeureText, 170);
  doc.text(forceMajeureLines, 20, yPos);
  yPos += forceMajeureLines.length * 7 + 7;
  
  const forceMajeureClauses = [
    'The affected party must immediately notify the other party in writing within seven (7) days of the occurrence.',
    'Both parties shall cooperate in good faith to minimize damages and find appropriate alternative solutions.',
    'If the force majeure event lasts more than thirty (30) days, either party may terminate the contract without penalty by giving written notice.',
    'During the force majeure period, obligations under this contract may be suspended without liability for breach.',
    'Rental fees will be prorated for the period when the premises cannot be used due to force majeure.',
    'The security deposit shall be returned to Party B in full within thirty (30) days after termination due to force majeure.',
    'Neither party shall be liable for damages caused by force majeure events.'
  ];
  
  forceMajeureClauses.forEach(clause => {
    if (yPos > 260) {
      doc.addPage();
      yPos = 20;
    }
    const clauseLines = doc.splitTextToSize(clause, 165);
    doc.text(clauseLines, 25, yPos);
    yPos += clauseLines.length * 7 + 3;
  });
  yPos += 10;

  // Check if we need a new page
  if (yPos > 200) {
    doc.addPage();
    yPos = 20;
  }

  // Article 12: Contract Termination
  doc.setFont(undefined, 'bold');
  doc.text('ARTICLE 12: UNILATERAL TERMINATION OF THE CONTRACT', 20, yPos);
  yPos += 10;
  
  doc.setFont(undefined, 'normal');
  doc.text('1/ Party A has the right to unilaterally terminate the contract when Party B:', 20, yPos);
  yPos += 10;
  
  const partyATermination = [
    'Fails to pay rent for two (2) consecutive months despite written reminders.',
    'Deliberately damages the leased premises or equipment.',
    'Uses the premises for illegal activities.',
    'Seriously affects environmental sanitation, fire protection safety, or disturbs neighbors.',
    'Sublets the premises without written consent from Party A.',
    'Makes unauthorized structural changes to the premises.',
    'Violates any material term of this contract after receiving written warning.',
    'Provides false information or documentation during contract execution.'
  ];
  
  partyATermination.forEach(term => {
    if (yPos > 265) {
      doc.addPage();
      yPos = 20;
    }
    const termLines = doc.splitTextToSize(term, 165);
    doc.text(termLines, 25, yPos);
    yPos += termLines.length * 7 + 3;
  });
  yPos += 5;
  
  if (yPos > 240) {
    doc.addPage();
    yPos = 20;
  }

  doc.text('2/ Party B has the right to unilaterally terminate the contract when Party A:', 20, yPos);
  yPos += 10;
  
  const partyBTermination = [
    'Increases the rental fee in violation of the agreed terms.',
    'Fails to conduct necessary major repairs within reasonable time causing premises to be uninhabitable.',
    'Continuously interferes with Party B\'s peaceful enjoyment of the premises.',
    'Fails to ensure the legal ownership or right to lease the premises.',
    'Violates privacy rights by entering premises without proper notice or consent.',
    'Fails to provide essential services (water, electricity) without valid reason.',
    'Violates any material term of this contract after receiving written notice from Party B.'
  ];
  
  partyBTermination.forEach(term => {
    if (yPos > 265) {
      doc.addPage();
      yPos = 20;
    }
    const termLines = doc.splitTextToSize(term, 165);
    doc.text(termLines, 25, yPos);
    yPos += termLines.length * 7 + 3;
  });
  yPos += 10;

  // Check if we need a new page
  if (yPos > 210) {
    doc.addPage();
    yPos = 20;
  }

  // Article 13: Contract Amendments
  doc.setFont(undefined, 'bold');
  doc.text('ARTICLE 13: CONTRACT AMENDMENTS AND MODIFICATIONS', 20, yPos);
  yPos += 10;
  
  doc.setFont(undefined, 'normal');
  const article13Text = 'Any amendments, modifications, or supplements to this contract must be made in writing and signed by both parties. Verbal agreements or amendments shall not be legally binding. All amendments shall become appendices to this contract and have the same legal effect as the main contract. Both parties must retain copies of all signed amendments.';
  const article13Lines = doc.splitTextToSize(article13Text, 170);
  doc.text(article13Lines, 20, yPos);
  yPos += article13Lines.length * 7 + 10;

  // Article 14: Notices
  doc.setFont(undefined, 'bold');
  doc.text('ARTICLE 14: NOTICES AND COMMUNICATIONS', 20, yPos);
  yPos += 10;
  
  doc.setFont(undefined, 'normal');
  const noticesText = 'All notices, requests, demands, and communications between the parties shall be made in writing and delivered through the following methods:';
  const noticesLines = doc.splitTextToSize(noticesText, 170);
  doc.text(noticesLines, 20, yPos);
  yPos += noticesLines.length * 7 + 7;
  
  const noticesClauses = [
    'Direct hand delivery with signed acknowledgment receipt.',
    'Registered mail with return receipt to the addresses stated in this contract.',
    'Email to the registered email addresses of both parties (with read receipt confirmation).',
    'Courier service with proof of delivery.',
    'Notices are deemed received: immediately upon hand delivery, three (3) working days after posting if by mail, or upon email read confirmation.',
    'Any change in contact information (address, phone number, email) must be notified to the other party within five (5) working days.',
    'Emergency communications may be made via phone call, but must be followed up with written confirmation within 24 hours.'
  ];
  
  noticesClauses.forEach(clause => {
    if (yPos > 265) {
      doc.addPage();
      yPos = 20;
    }
    const clauseLines = doc.splitTextToSize(clause, 165);
    doc.text(clauseLines, 25, yPos);
    yPos += clauseLines.length * 7 + 3;
  });
  yPos += 10;

  // Check if we need a new page for appendices
  if (yPos > 180) {
    doc.addPage();
    yPos = 20;
  }

  // Appendices Section
  doc.setFont(undefined, 'bold');
  doc.text('APPENDICES', 20, yPos);
  doc.line(20, yPos + 2, 70, yPos + 2);
  yPos += 10;
  
  doc.setFont(undefined, 'normal');
  doc.text('This contract includes the following appendices as integral parts:', 20, yPos);
  yPos += 10;
  
  let appendix2Text = 'Appendix 2: Initial utility meter readings (electricity, water) with photographs and signatures';
  if (electricityReading || waterReading) {
    appendix2Text += ' - ';
    const details = [];
    if (electricityReading) {
      const elecIndex = electricityReading.currentIndex || electricityReading.CurrentIndex || 0;
      const elecPrice = electricityReading.price || electricityReading.Price || 0;
      details.push(`Electricity: ${elecIndex} kWh @ ${elecPrice} VND/kWh`);
    }
    if (waterReading) {
      const waterIndex = waterReading.currentIndex || waterReading.CurrentIndex || 0;
      const waterPrice = waterReading.price || waterReading.Price || 0;
      details.push(`Water: ${waterIndex} m³ @ ${waterPrice} VND/m³`);
    }
    appendix2Text += details.join(', ');
  }
  
  const appendices = [
    'Appendix 1: Detailed inventory list of furniture and equipment in the leased room with condition assessment',
    appendix2Text,
    'Appendix 3: Room condition inspection report with photographs from multiple angles',
    'Appendix 4: House rules, regulations, and community guidelines',
    'Appendix 5: Payment schedule, bank account details, and accepted payment methods',
    'Appendix 6: Emergency contact information for both parties and relevant authorities',
    'Appendix 7: Copy of Party A\'s property ownership documents',
    'Appendix 8: Copy of Party B\'s identification documents'
  ];
  
  appendices.forEach((appendix, index) => {
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }
    const appendixLine = `${index + 1}. ${appendix}`;
    const appendixLines = doc.splitTextToSize(appendixLine, 165);
    doc.text(appendixLines, 25, yPos);
    yPos += appendixLines.length * 7 + 3;
  });
  yPos += 10;

  // Final Statement
  doc.setFont(undefined, 'italic');
  const finalStatement = 'The contracting parties hereby acknowledge that they have carefully read, fully understood, and voluntarily agreed to all terms and conditions set forth in this contract and its appendices. Both parties execute this contract in good faith, with clear mind and without any coercion, fraud, or duress. This contract represents the entire agreement between the parties and supersedes any prior oral or written agreements.';
  const finalLines = doc.splitTextToSize(finalStatement, 170);
  
  if (yPos + finalLines.length * 7 > 270) {
    doc.addPage();
    yPos = 20;
  }
  
  doc.text(finalLines, 20, yPos);
  yPos += finalLines.length * 7 + 15;

  // Additional Occupants Information (if more than 1 person)
  if (identityProfiles.length > 0) {
    if (yPos > 220) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFont(undefined, 'bold');
    doc.setFontSize(12);
    doc.text('OCCUPANT INFORMATION', 20, yPos);
    yPos += 10;
    
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    doc.text(`Total number of occupants registered under this contract: ${identityProfiles.length}`, 20, yPos);
    yPos += 10;
    
    identityProfiles.forEach((profile, index) => {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      
      const isSigner = profile.isSigner || profile.IsSigner;
      doc.setFont(undefined, 'bold');
      doc.text(`${index + 1}. ${profile.fullName || profile.FullName || 'N/A'}${isSigner ? ' (Primary Signer)' : ''}`, 20, yPos);
      yPos += 7;
      
      doc.setFont(undefined, 'normal');
      const occupantDetails = [];
      
      // Add tenant ID if available
      const tenantId = profile.tenantId || profile.TenantId;
      if (tenantId) {
        occupantDetails.push(`   - Tenant ID: ${tenantId.slice(0, 13)}`);
      }
      
      occupantDetails.push(
        `   - Citizen ID: ${profile.citizenIdNumber || profile.CitizenIdNumber || 'N/A'}`,
        `   - ID Issued: ${profile.citizenIdIssuedDate || profile.CitizenIdIssuedDate ? new Date(profile.citizenIdIssuedDate || profile.CitizenIdIssuedDate).toLocaleDateString('en-GB') : 'N/A'} at ${profile.citizenIdIssuedPlace || profile.CitizenIdIssuedPlace || 'N/A'}`,
        `   - Date of Birth: ${profile.dateOfBirth || profile.DateOfBirth ? new Date(profile.dateOfBirth || profile.DateOfBirth).toLocaleDateString('en-GB') : 'N/A'}`,
        `   - Phone: ${profile.phoneNumber || profile.PhoneNumber || 'N/A'}`,
        `   - Email: ${profile.email || profile.Email || 'N/A'}`,
        `   - Address: ${profile.address || profile.Address || 'N/A'}`
      );
      
      // Add location if available
      const provinceName = profile.provinceName || profile.ProvinceName;
      const wardName = profile.wardName || profile.WardName;
      if (provinceName || wardName) {
        occupantDetails.push(`   - Location: ${wardName ? wardName + ', ' : ''}${provinceName || ''}`);
      }
      
      // Add temporary residence if different from address
      const tempRes = profile.temporaryResidence || profile.TemporaryResidence;
      if (tempRes && tempRes !== (profile.address || profile.Address)) {
        occupantDetails.push(`   - Temporary Residence: ${tempRes}`);
      }
      
      // Add profile notes if any
      const profileNotes = profile.notes || profile.Notes;
      if (profileNotes && profileNotes.trim()) {
        occupantDetails.push(`   - Notes: ${profileNotes}`);
      }
      
      occupantDetails.forEach(detail => {
        if (yPos > 280) {
          doc.addPage();
          yPos = 20;
        }
        const detailLines = doc.splitTextToSize(detail, 170);
        doc.text(detailLines, 20, yPos);
        yPos += detailLines.length * 6;
      });
      yPos += 5;
    });
    
    yPos += 5;
  }

  // Contract Notes (if any)
  const contractNotes = contract.notes || contract.Notes;
  if (contractNotes && contractNotes.trim()) {
    if (yPos > 240) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFont(undefined, 'bold');
    doc.setFontSize(11);
    doc.text('ADDITIONAL NOTES AND SPECIAL TERMS:', 20, yPos);
    yPos += 10;
    
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    const notesLines = doc.splitTextToSize(contractNotes, 170);
    doc.text(notesLines, 20, yPos);
    yPos += notesLines.length * 7 + 10;
  }

  // Contract Images (if uploaded)
  const contractImages = contract.contractImage || contract.ContractImage;
  const uploadedAt = contract.contractUploadedAt || contract.ContractUploadedAt;
  if (contractImages && contractImages.length > 0) {
    if (yPos > 260) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFont(undefined, 'bold');
    doc.setFontSize(10);
    doc.text('SCANNED CONTRACT DOCUMENTS:', 20, yPos);
    yPos += 8;
    
    doc.setFont(undefined, 'italic');
    doc.setFontSize(9);
    doc.text(`Total ${contractImages.length} document image(s) uploaded${uploadedAt ? ' on ' + new Date(uploadedAt).toLocaleDateString('en-GB') : ''}`, 20, yPos);
    yPos += 6;
    
    doc.setFont(undefined, 'normal');
    contractImages.forEach((imageUrl, index) => {
      if (yPos > 275) {
        doc.addPage();
        yPos = 20;
      }
      const shortUrl = imageUrl.length > 80 ? imageUrl.substring(0, 77) + '...' : imageUrl;
      doc.text(`${index + 1}. ${shortUrl}`, 25, yPos);
      yPos += 5;
    });
    yPos += 10;
  }

  // Contract Summary Section
  if (yPos > 200) {
    doc.addPage();
    yPos = 20;
  }
  
  doc.setFont(undefined, 'bold');
  doc.setFontSize(12);
  doc.text('CONTRACT SUMMARY', 20, yPos);
  yPos += 10;
  
  doc.setFont(undefined, 'normal');
  doc.setFontSize(10);
  
  const summaryData = [
    ['Contract ID', contract.id?.slice(0, 13) || 'N/A'],
    ['Room', roomName],
    ['Monthly Rent', `${monthlyRent.toLocaleString()} VND`],
    ['Deposit', `${depositAmount.toLocaleString()} VND`],
    ['Duration', `${Math.round((checkoutDate - checkinDate) / (1000 * 60 * 60 * 24))} days`],
    ['Check-in', checkinDate.toLocaleDateString('en-GB')],
    ['Check-out', checkoutDate.toLocaleDateString('en-GB')],
    ['Occupants', `${numberOfOccupants} person(s)`],
    ['Status', contractStatus],
    ['Created', createdAt ? createdAt.toLocaleDateString('en-GB') : 'N/A']
  ];
  
  // Add utility totals if available
  if (electricityReading) {
    const elecTotal = electricityReading.total || electricityReading.Total || 0;
    if (elecTotal > 0) {
      summaryData.push(['Initial Electricity Bill', `${elecTotal.toLocaleString()} VND`]);
    }
  }
  if (waterReading) {
    const waterTotal = waterReading.total || waterReading.Total || 0;
    if (waterTotal > 0) {
      summaryData.push(['Initial Water Bill', `${waterTotal.toLocaleString()} VND`]);
    }
  }
  
  summaryData.forEach(([label, value]) => {
    if (yPos > 275) {
      doc.addPage();
      yPos = 20;
    }
    doc.setFont(undefined, 'bold');
    doc.text(`${label}:`, 25, yPos);
    doc.setFont(undefined, 'normal');
    doc.text(value, 85, yPos);
    yPos += 7;
  });
  yPos += 10;

  // Signatures Section
  if (yPos > 180) {
    doc.addPage();
    yPos = 20;
  }
  
  doc.setFont(undefined, 'bold');
  doc.setFontSize(12);
  doc.text('SIGNATURES OF THE PARTIES', 105, yPos, { align: 'center' });
  doc.line(20, yPos + 3, 190, yPos + 3);
  yPos += 15;
  
  // Date and place of signing
  doc.setFont(undefined, 'italic');
  doc.setFontSize(11);
  const signingDate = new Date().toLocaleDateString('en-GB');
  doc.text(`Ho Chi Minh City, date ${signingDate}`, 105, yPos, { align: 'center' });
  yPos += 15;
  
  // Create two columns for signatures
  doc.setFont(undefined, 'bold');
  doc.setFontSize(11);
  doc.text('PARTY A (LESSOR)', 55, yPos, { align: 'center' });
  doc.text('PARTY B (LESSEE)', 155, yPos, { align: 'center' });
  yPos += 10;
  
  doc.setFont(undefined, 'normal');
  doc.setFontSize(10);
  doc.text('EZStay Property Management', 55, yPos, { align: 'center' });
  doc.text(tenant.fullName || tenant.FullName || tenantName || 'Tenant Name', 155, yPos, { align: 'center' });
  yPos += 7;
  
  doc.text('Ho Chi Minh City, Vietnam', 55, yPos, { align: 'center' });
  const signatureAddress = tenant.address || tenant.Address || tenantAddress || 'Address';
  const shortAddress = signatureAddress.length > 30 ? signatureAddress.substring(0, 27) + '...' : signatureAddress;
  doc.text(shortAddress, 155, yPos, { align: 'center' });
  yPos += 20;
  
  // Digital Signature boxes
  doc.setFont(undefined, 'italic');
  doc.setFontSize(9);
  doc.text('(Digital Signature)', 55, yPos, { align: 'center' });
  doc.text('(Digital Signature)', 155, yPos, { align: 'center' });
  yPos += 5;
  
  // Signature image boxes
  const signatureBoxHeight = 40;
  const signatureBoxWidth = 60;
  
  // Owner signature
  doc.rect(25, yPos, signatureBoxWidth, signatureBoxHeight);
  if (ownerSignature) {
    try {
      doc.addImage(ownerSignature, 'PNG', 27, yPos + 2, signatureBoxWidth - 4, signatureBoxHeight - 4);
    } catch (error) {
      console.error('Error adding owner signature to PDF:', error);
      doc.setFontSize(8);
      doc.setTextColor(200, 0, 0);
      doc.text('Signature Error', 55, yPos + 20, { align: 'center' });
      doc.setTextColor(0, 0, 0);
    }
  } else {
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('No signature', 55, yPos + 20, { align: 'center' });
    doc.setTextColor(0, 0, 0);
  }
  
  // Tenant signature
  doc.rect(125, yPos, signatureBoxWidth, signatureBoxHeight);
  if (tenantSignature) {
    try {
      doc.addImage(tenantSignature, 'PNG', 127, yPos + 2, signatureBoxWidth - 4, signatureBoxHeight - 4);
    } catch (error) {
      console.error('Error adding tenant signature to PDF:', error);
      doc.setFontSize(8);
      doc.setTextColor(200, 0, 0);
      doc.text('Signature Error', 155, yPos + 20, { align: 'center' });
      doc.setTextColor(0, 0, 0);
    }
  } else {
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('No signature', 155, yPos + 20, { align: 'center' });
    doc.setTextColor(0, 0, 0);
  }
  
  yPos += signatureBoxHeight + 10;
  
  // Names under signature boxes
  doc.setFont(undefined, 'normal');
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text('___________________________', 55, yPos, { align: 'center' });
  doc.text('___________________________', 155, yPos, { align: 'center' });
  yPos += 7;
  
  doc.text('Representative Name', 55, yPos, { align: 'center' });
  doc.text(tenant.fullName || 'Tenant Name', 155, yPos, { align: 'center' });
  yPos += 20;
  
  // Verification note
  if (ownerSignature && tenantSignature) {
    doc.setFontSize(9);
    doc.setTextColor(0, 128, 0);
    doc.setFont(undefined, 'italic');
    doc.text('✓ Digital signatures have been verified and attached to this document', 105, yPos, { align: 'center' });
    yPos += 7;
    doc.text(`Signed electronically on ${signingDate}`, 105, yPos, { align: 'center' });
  }

  // Footer on last page
  doc.setFontSize(9);
  doc.setFont(undefined, 'italic');
  doc.setTextColor(100, 100, 100);
  const footerY = 280;
  doc.text('_______________________________________________________________________________', 105, footerY - 5, { align: 'center' });
  doc.text(`Generated on ${new Date().toLocaleDateString('en-GB')} at ${new Date().toLocaleTimeString('en-GB')}`, 105, footerY, { align: 'center' });
  doc.text('EZStay - Professional Property Management System', 105, footerY + 5, { align: 'center' });
  doc.text('This is a legally binding document. Please retain for your records.', 105, footerY + 10, { align: 'center' });

  return doc;
}

/**
 * Preview contract PDF in a new window
 */
export function previewContractPDF(contract, ownerSignature = null, tenantSignature = null) {
  const doc = generateContractPDF(contract, ownerSignature, tenantSignature);
  
  // Open preview in new window
  const pdfDataUri = doc.output('datauristring');
  const newWindow = window.open();
  if (newWindow) {
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
  } else {
    alert('Please allow popups to preview the contract PDF');
  }
}

/**
 * Download contract PDF
 */
export function downloadContractPDF(contract, ownerSignature = null, tenantSignature = null) {
  const doc = generateContractPDF(contract, ownerSignature, tenantSignature);
  doc.save(`Contract-${contract.id?.slice(0, 8) || 'unknown'}-${new Date().toISOString().split('T')[0]}.pdf`);
}
