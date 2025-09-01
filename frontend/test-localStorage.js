// Test script to verify localStorage functionality
// Run this in browser console

// Clear any existing data
localStorage.removeItem('sales_customers');

// Test customer creation
const CustomerStorageService = {
  getCustomers() {
    try {
      const data = localStorage.getItem('sales_customers');
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting customers:', error);
      return [];
    }
  },

  addCustomer(customer) {
    try {
      const customers = this.getCustomers();
      const newCustomer = {
        ...customer,
        customerCode: `CUST-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      customers.push(newCustomer);
      localStorage.setItem('sales_customers', JSON.stringify(customers));
      return newCustomer;
    } catch (error) {
      console.error('Error adding customer:', error);
      return null;
    }
  },

  getAllCustomers() {
    return this.getCustomers();
  }
};

// Test adding a customer
console.log('Testing customer creation...');
const testCustomer = {
  id: 'CUST' + Date.now(),
  name: 'Test Customer',
  email: 'test@example.com',
  phone: '123-456-7890',
  company: 'Test Company',
  address: '123 Test St',
  status: 'active'
};

const result = CustomerStorageService.addCustomer(testCustomer);
console.log('Added customer:', result);

const allCustomers = CustomerStorageService.getAllCustomers();
console.log('All customers:', allCustomers);

console.log('Test completed! Check if customer was added successfully.');
