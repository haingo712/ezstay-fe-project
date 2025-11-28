"use client";
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import contractService from '@/services/contractService';
import PreviewSignedPDF from '@/components/PreviewSignedPDF';
import { toast } from 'react-toastify';
import { useTranslation } from '@/hooks/useTranslation';

export default function ContractDetailPage() {
  const { t } = useTranslation();
  const params = useParams();
  const router = useRouter();
  const contractId = params.contractId;

  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadContract = async () => {
      try {
        setLoading(true);
        const data = await contractService.getById(contractId);
        setContract(data);
      } catch (error) {
        console.error('Error loading contract:', error);
        toast.error(t('contractDetail.errors.loadFailed'));
      } finally {
        setLoading(false);
      }
    };

    if (contractId) {
      loadContract();
    }
  }, [contractId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">{t('contractDetail.notFound')}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {t('common.back')}
          </button>
        </div>
      </div>
    );
  }

  const tenant = contract.identityProfiles?.[0] || contract.IdentityProfiles?.[0] || {};
  const roomDetails = contract.roomDetails || contract.RoomDetails || {};
  const contractStatus = contract.contractStatus || contract.ContractStatus || 'N/A';
  const ownerSignature = contract.ownerSignature || contract.OwnerSignature;
  const tenantSignature = contract.tenantSignature || contract.TenantSignature;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('contractDetail.title')}
            </h1>
            <button
              onClick={() => router.back()}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Contract Status Badge */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">{t('contractDetail.status')}:</span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              contractStatus === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
              contractStatus === 'Pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
              contractStatus === 'Cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
              'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
            }`}>
              {contractStatus}
            </span>
          </div>

          {/* Contract ID */}
          <div className="text-sm text-gray-600 dark:text-gray-400">
            ID: {contract.id?.slice(0, 13) || 'N/A'}
          </div>
        </div>

        {/* Contract Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            {t('contractDetail.contractInfo')}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Room Info */}
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                {t('contractDetail.room')}
              </label>
              <p className="text-gray-900 dark:text-white">
                {contract.roomName || roomDetails.name || roomDetails.Name || 'N/A'}
              </p>
            </div>

            {/* Monthly Rent */}
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                {t('contractDetail.monthlyRent')}
              </label>
              <p className="text-gray-900 dark:text-white">
                {(contract.roomPrice || contract.RoomPrice || 0).toLocaleString()} VND
              </p>
            </div>

            {/* Deposit */}
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                {t('contractDetail.deposit')}
              </label>
              <p className="text-gray-900 dark:text-white">
                {(contract.depositAmount || contract.DepositAmount || 0).toLocaleString()} VND
              </p>
            </div>

            {/* Check-in Date */}
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                {t('contractDetail.checkinDate')}
              </label>
              <p className="text-gray-900 dark:text-white">
                {contract.checkinDate || contract.CheckinDate ? 
                  new Date(contract.checkinDate || contract.CheckinDate).toLocaleDateString('vi-VN') : 
                  'N/A'}
              </p>
            </div>

            {/* Check-out Date */}
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                {t('contractDetail.checkoutDate')}
              </label>
              <p className="text-gray-900 dark:text-white">
                {contract.checkoutDate || contract.CheckoutDate ? 
                  new Date(contract.checkoutDate || contract.CheckoutDate).toLocaleDateString('vi-VN') : 
                  'N/A'}
              </p>
            </div>

            {/* Number of Occupants */}
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                {t('contractDetail.numberOfOccupants')}
              </label>
              <p className="text-gray-900 dark:text-white">
                {contract.numberOfOccupants || contract.NumberOfOccupants || 
                 contract.identityProfiles?.length || contract.IdentityProfiles?.length || 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Tenant Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            {t('contractDetail.tenantInfo')}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                {t('contractDetail.fullName')}
              </label>
              <p className="text-gray-900 dark:text-white">
                {tenant.fullName || tenant.FullName || 'N/A'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                {t('contractDetail.phoneNumber')}
              </label>
              <p className="text-gray-900 dark:text-white">
                {tenant.phoneNumber || tenant.PhoneNumber || 'N/A'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Email
              </label>
              <p className="text-gray-900 dark:text-white">
                {tenant.email || tenant.Email || 'N/A'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                {t('contractDetail.citizenId')}
              </label>
              <p className="text-gray-900 dark:text-white">
                {tenant.citizenIdNumber || tenant.CitizenIdNumber || 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Signatures */}
        {(ownerSignature || tenantSignature) && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {t('contractDetail.signatures')}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Owner Signature */}
              {ownerSignature && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                    {t('contractDetail.ownerSignature')}
                  </label>
                  <div className="border-2 border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-900">
                    <img 
                      src={ownerSignature} 
                      alt="Owner Signature" 
                      className="max-h-32 mx-auto"
                    />
                  </div>
                </div>
              )}

              {/* Tenant Signature */}
              {tenantSignature && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                    {t('contractDetail.tenantSignature')}
                  </label>
                  <div className="border-2 border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-900">
                    <img 
                      src={tenantSignature} 
                      alt="Tenant Signature" 
                      className="max-h-32 mx-auto"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* PDF Preview Buttons */}
        {contract && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {t('contractDetail.contractPDF')}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {t('contractDetail.contractPDFDescription')}
            </p>
            <PreviewSignedPDF
              contract={contract}
              ownerSignature={ownerSignature}
              tenantSignature={tenantSignature}
            />
          </div>
        )}
      </div>
    </div>
  );
}
