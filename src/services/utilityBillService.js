// Utility Bill Service for Guest Users
import { apiFetch } from "@/utils/api";

// Use API Gateway URL (localhost for development, can be changed via env)
const UTILITY_BILL_API_BASE = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:7001';

// Helper to get auth token
const getAuthToken = () => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('authToken') ||
            localStorage.getItem('ezstay_token') ||
            localStorage.getItem('token');
    }
    return null;
};

// Retry fetch with exponential backoff for Render cold start
const fetchWithRetry = async (url, options, maxRetries = 3) => {
    for (let i = 0; i < maxRetries; i++) {
        try {
            const response = await fetch(url, options);
            
            // If server is waking up, it might return 502/503
            if (response.status === 502 || response.status === 503) {
                console.log(`⏳ UtilityBillAPI waking up... Retry ${i + 1}/${maxRetries}`);
                await new Promise(resolve => setTimeout(resolve, (i + 1) * 3000)); // Wait 3s, 6s, 9s
                continue;
            }
            
            return response;
        } catch (error) {
            console.log(`❌ Fetch error, retry ${i + 1}/${maxRetries}:`, error.message);
            if (i === maxRetries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, (i + 1) * 3000));
        }
    }
};

class UtilityBillService {
    /**
     * Get utility bills for tenant (Guest User)
     * @param {Object} odataParams - OData query parameters ($filter, $orderby, $top, $skip)
     * @returns {Promise} List of utility bills
     */
    async getTenantBills(odataParams = {}) {
        try {
            // Build OData query string
            const queryParams = new URLSearchParams();

            if (odataParams.$filter) {
                queryParams.append('$filter', odataParams.$filter);
            }
            if (odataParams.$orderby) {
                queryParams.append('$orderby', odataParams.$orderby);
            }
            if (odataParams.$top) {
                queryParams.append('$top', odataParams.$top);
            }
            if (odataParams.$skip) {
                queryParams.append('$skip', odataParams.$skip);
            }
            if (odataParams.$count !== undefined) {
                queryParams.append('$count', odataParams.$count);
            }

            const queryString = queryParams.toString();
            const endpoint = queryString ? `/api/UtilityBills/tenant?${queryString}` : '/api/UtilityBills/tenant';
            const url = `${UTILITY_BILL_API_BASE}${endpoint}`;

            console.log('💰 Fetching tenant bills from:', url);

            const token = getAuthToken();
            const response = await fetchWithRetry(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` })
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('✅ Tenant bills fetched:', data);
            return data;
        } catch (error) {
            console.error('❌ Error fetching tenant bills:', error);
            throw error;
        }
    }

    /**
     * Get all bills for tenant including deposit bills from contracts
     * This method combines tenant bills with deposit bills from user's contracts
     * @param {Object} odataParams - OData query parameters
     * @returns {Promise} Combined list of all bills
     */
    async getAllTenantBillsIncludingDeposit(odataParams = {}) {
        try {
            // Get regular tenant bills
            const tenantBillsResponse = await this.getTenantBills(odataParams);
            const tenantBills = tenantBillsResponse?.value || tenantBillsResponse || [];
            
            // Get user's contracts to find deposit bills
            const token = getAuthToken();
            let depositBills = [];
            
            try {
                const contractsUrl = `${UTILITY_BILL_API_BASE}/api/Contract/my-contract`;
                const contractsResponse = await fetchWithRetry(contractsUrl, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token && { 'Authorization': `Bearer ${token}` })
                    }
                });
                
                if (contractsResponse.ok) {
                    const contracts = await contractsResponse.json();
                    console.log('📋 User contracts:', contracts);
                    
                    // For each contract, check for deposit bill
                    for (const contract of (contracts || [])) {
                        const contractId = contract.id || contract.Id;
                        if (contractId) {
                            const depositBill = await this.getDepositBillByContractIdDirect(contractId);
                            if (depositBill && !tenantBills.some(b => (b.id || b.Id) === (depositBill.id || depositBill.Id))) {
                                depositBills.push(depositBill);
                            }
                        }
                    }
                }
            } catch (contractError) {
                console.log('⚠️ Could not fetch contracts for deposit bills:', contractError.message);
            }
            
            // Combine and sort by CreatedAt desc
            const allBills = [...tenantBills, ...depositBills];
            allBills.sort((a, b) => {
                const dateA = new Date(a.createdAt || a.CreatedAt || 0);
                const dateB = new Date(b.createdAt || b.CreatedAt || 0);
                return dateB - dateA;
            });
            
            console.log('✅ All tenant bills (including deposit):', allBills);
            return { value: allBills };
        } catch (error) {
            console.error('❌ Error fetching all tenant bills:', error);
            throw error;
        }
    }

    /**
     * Get deposit bill by contractId using direct API call
     * @param {string} contractId - Contract ID
     * @returns {Promise} Deposit bill or null
     */
    async getDepositBillByContractIdDirect(contractId) {
        try {
            // Try to get bills filtered by contractId and BillType=Deposit
            const url = `${UTILITY_BILL_API_BASE}/api/UtilityBills?$filter=ContractId eq ${contractId} and BillType eq 'Deposit'`;
            const token = getAuthToken();
            
            const response = await fetchWithRetry(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` })
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                const bills = data?.value || data || [];
                return bills.find(b => {
                    const billContractId = (b.contractId || b.ContractId || '').toLowerCase();
                    const targetContractId = contractId.toLowerCase();
                    const billType = b.billType || b.BillType;
                    return billContractId === targetContractId && 
                           (billType === 2 || billType === 'Deposit');
                }) || null;
            }
            return null;
        } catch (error) {
            console.log('⚠️ Could not get deposit bill for contract:', contractId, error.message);
            return null;
        }
    }

    /**
     * Get bill by ID
     * @param {string} billId - Bill ID
     * @returns {Promise} Bill details
     */
    async getBillById(billId) {
        try {
            const url = `${UTILITY_BILL_API_BASE}/api/UtilityBills/${billId}`;
            console.log('💰 Fetching bill from:', url);

            const token = getAuthToken();
            const response = await fetchWithRetry(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` })
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('✅ Bill fetched:', data);
            return data;
        } catch (error) {
            console.error('❌ Error fetching bill:', error);
            throw error;
        }
    }

    /**
     * Mark bill as paid
     * @param {string} billId - Bill ID
     * @param {string} paymentMethod - Payment method (Online/Offline)
     * @returns {Promise} Update result
     */
    async markBillAsPaid(billId, paymentMethod) {
        try {
            const url = `${UTILITY_BILL_API_BASE}/api/UtilityBills/${billId}/pay`;
            console.log(`💳 Marking bill ${billId} as paid with method ${paymentMethod}`);

            const token = getAuthToken();
            const response = await fetchWithRetry(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` })
                },
                body: JSON.stringify({ paymentMethod }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('✅ Bill marked as paid:', data);
            return data;
        } catch (error) {
            console.error('❌ Error marking bill as paid:', error);
            throw error;
        }
    }

    /**
     * Get utility bill status label
     * @param {string} status - Bill status enum value
     * @returns {Object} Label and color for status
     */
    getStatusLabel(status) {
        const statusMap = {
            'Unpaid': { label: 'Chưa thanh toán', color: 'warning', bgColor: 'bg-yellow-100', textColor: 'text-yellow-800' },
            'Paid': { label: 'Đã thanh toán', color: 'success', bgColor: 'bg-green-100', textColor: 'text-green-800' },
            'Overdue': { label: 'Quá hạn', color: 'error', bgColor: 'bg-red-100', textColor: 'text-red-800' },
            'Cancelled': { label: 'Đã hủy', color: 'default', bgColor: 'bg-gray-100', textColor: 'text-gray-800' },
        };

        return statusMap[status] || { label: status, color: 'default', bgColor: 'bg-gray-100', textColor: 'text-gray-800' };
    }

    /**
     * Get deposit bill for a contract
     * @param {string} contractId - Contract ID
     * @returns {Promise} Deposit bill or null
     */
    async getDepositBillByContractId(contractId) {
        try {
            console.log('💰 Fetching deposit bill for contract:', contractId);
            
            // Get all tenant bills using direct API call
            const bills = await this.getTenantBills();
            const billList = bills?.value || bills || [];
            console.log('✅ All tenant bills:', billList);
            
            // Filter by contractId and BillType = Deposit (2)
            const depositBill = billList.find(b => {
                const billContractId = (b.contractId || b.ContractId || '').toLowerCase();
                const targetContractId = contractId.toLowerCase();
                const billType = b.billType || b.BillType;
                const status = b.status || b.Status;
                
                return billContractId === targetContractId && 
                       (billType === 2 || billType === 'Deposit') && 
                       status !== 'Cancelled';
            });
            
            console.log('✅ Deposit bill for contract:', contractId, depositBill);
            return depositBill || null;
        } catch (error) {
            console.error('❌ Error fetching deposit bill:', error);
            return null;
        }
    }

    /**
     * Create deposit bill for a contract (Owner only)
     * @param {string} contractId - Contract ID
     * @returns {Promise} Created deposit bill
     */
    async createDepositBill(contractId) {
        try {
            const url = `${UTILITY_BILL_API_BASE}/api/UtilityBills/deposit/${contractId}`;
            console.log('💰 Creating deposit bill for contract:', contractId);
            
            const token = getAuthToken();
            const response = await fetchWithRetry(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` })
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('✅ Deposit bill created:', data);
            return data;
        } catch (error) {
            console.error('❌ Error creating deposit bill:', error);
            throw error;
        }
    }

    /**
     * Get deposit bill for a contract (Owner version - uses owner endpoint)
     * @param {string} contractId - Contract ID
     * @returns {Promise} Deposit bill or null
     */
    async getDepositBillByContractIdForOwner(contractId) {
        try {
            console.log('💰 Fetching deposit bill for contract (owner):', contractId);
            
            // Use owner endpoint with direct API call
            const url = `${UTILITY_BILL_API_BASE}/api/UtilityBills/owner`;
            const token = getAuthToken();
            const response = await fetchWithRetry(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` })
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            const bills = data?.value || data || [];
            console.log('✅ All owner bills:', bills);
            
            // Filter by contractId and BillType = Deposit (2)
            const depositBill = bills.find(b => {
                const billContractId = (b.contractId || b.ContractId || '').toLowerCase();
                const targetContractId = contractId.toLowerCase();
                const billType = b.billType || b.BillType;
                const status = b.status || b.Status;
                
                return billContractId === targetContractId && 
                       (billType === 2 || billType === 'Deposit') && 
                       status !== 'Cancelled';
            });
            
            console.log('✅ Deposit bill for contract:', contractId, depositBill);
            return depositBill || null;
        } catch (error) {
            console.error('❌ Error fetching deposit bill (owner):', error);
            return null;
        }
    }

    /**
     * Format currency to VND
     * @param {number} amount - Amount to format
     * @returns {string} Formatted currency
     */
    formatCurrency(amount) {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    }

    /**
     * Format date to Vietnamese format
     * @param {string|Date} date - Date to format
     * @returns {string} Formatted date
     */
    formatDate(date) {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}

const utilityBillService = new UtilityBillService();
export default utilityBillService;
