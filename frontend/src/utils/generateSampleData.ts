// Sample data generator for demonstrating Sales module functionality
// This file can be run in the browser console to populate localStorage with test data

const generateSampleData = () => {
  console.log('Generating sample data for Sales modules...');

  // Sample Customers
  const customers = [
    {
      id: 'CUST001',
      name: 'ABC Corporation',
      email: 'contact@abccorp.com',
      phone: '+91-9876543210',
      address: '123 Business Park, Mumbai, Maharashtra 400001',
      contactPerson: 'Rajesh Kumar',
      createdAt: '2024-01-15',
      status: 'active'
    },
    {
      id: 'CUST002',
      name: 'XYZ Industries',
      email: 'info@xyzind.com',
      phone: '+91-9876543211',
      address: '456 Industrial Area, Delhi, Delhi 110001',
      contactPerson: 'Priya Sharma',
      createdAt: '2024-01-10',
      status: 'active'
    },
    {
      id: 'CUST003',
      name: 'Tech Solutions Ltd',
      email: 'hello@techsol.com',
      phone: '+91-9876543212',
      address: '789 Tech Hub, Bangalore, Karnataka 560001',
      contactPerson: 'Amit Patel',
      createdAt: '2024-01-20',
      status: 'active'
    }
  ];

  // Sample Quotations
  const quotations = [
    {
      id: 'QUOT001',
      quotationNumber: 'Q-2024-001',
      customer: 'ABC Corporation',
      subject: 'Software Development Services',
      quotationDate: '2024-01-25',
      validTill: '2024-02-25',
      totalAmount: 250000,
      status: 'sent',
      items: [
        { name: 'Web Application', quantity: 1, rate: 150000, amount: 150000 },
        { name: 'Mobile App', quantity: 1, rate: 100000, amount: 100000 }
      ],
      createdAt: '2024-01-25T10:00:00Z'
    },
    {
      id: 'QUOT002',
      quotationNumber: 'Q-2024-002',
      customer: 'XYZ Industries',
      subject: 'ERP Implementation',
      quotationDate: '2024-01-26',
      validTill: '2024-02-26',
      totalAmount: 500000,
      status: 'confirmed',
      items: [
        { name: 'ERP Software License', quantity: 1, rate: 300000, amount: 300000 },
        { name: 'Implementation Services', quantity: 1, rate: 200000, amount: 200000 }
      ],
      createdAt: '2024-01-26T14:30:00Z'
    },
    {
      id: 'QUOT003',
      quotationNumber: 'Q-2024-003',
      customer: 'Tech Solutions Ltd',
      subject: 'Cloud Infrastructure Setup',
      quotationDate: '2024-01-27',
      validTill: '2024-02-27',
      totalAmount: 150000,
      status: 'sent',
      items: [
        { name: 'AWS Setup', quantity: 1, rate: 100000, amount: 100000 },
        { name: 'Migration Services', quantity: 1, rate: 50000, amount: 50000 }
      ],
      createdAt: '2024-01-27T09:15:00Z'
    }
  ];

  // Sample Dispatches
  const dispatches = [
    {
      id: 'DISP001',
      dispatchNumber: 'DSP-2024-001',
      orderNumber: 'ORD-2024-001',
      customerName: 'ABC Corporation',
      deliveryAddress: '123 Business Park, Mumbai, Maharashtra 400001',
      dispatchDate: '2024-01-28',
      trackingNumber: 'TRK123456789',
      totalItems: 2,
      totalWeight: 15.5,
      status: 'in_transit',
      driverName: 'Suresh Kumar',
      vehicleNumber: 'MH 01 AB 1234',
      createdAt: '2024-01-28T08:00:00Z'
    },
    {
      id: 'DISP002',
      dispatchNumber: 'DSP-2024-002',
      orderNumber: 'ORD-2024-002',
      customerName: 'XYZ Industries',
      deliveryAddress: '456 Industrial Area, Delhi, Delhi 110001',
      dispatchDate: '2024-01-29',
      trackingNumber: 'TRK987654321',
      totalItems: 5,
      totalWeight: 25.0,
      status: 'delivered',
      driverName: 'Ramesh Singh',
      vehicleNumber: 'DL 02 CD 5678',
      createdAt: '2024-01-29T11:30:00Z'
    },
    {
      id: 'DISP003',
      dispatchNumber: 'DSP-2024-003',
      orderNumber: 'ORD-2024-003',
      customerName: 'Tech Solutions Ltd',
      deliveryAddress: '789 Tech Hub, Bangalore, Karnataka 560001',
      dispatchDate: '2024-01-30',
      trackingNumber: 'TRK555666777',
      totalItems: 3,
      totalWeight: 8.2,
      status: 'ready_to_ship',
      driverName: 'Vikram Reddy',
      vehicleNumber: 'KA 03 EF 9012',
      createdAt: '2024-01-30T16:45:00Z'
    }
  ];

  // Sample Invoices
  const invoices = [
    {
      id: 'INV001',
      invoiceNumber: 'INV-2024-001',
      orderNumber: 'ORD-2024-001',
      customerName: 'ABC Corporation',
      poNumber: 'PO-ABC-001',
      invoiceDate: '2024-01-25',
      dueDate: '2024-02-24',
      totalAmount: 250000,
      taxAmount: 45000,
      status: 'sent',
      paymentTerms: 'Net 30',
      paymentMethod: 'Bank Transfer',
      billingAddress: '123 Business Park, Mumbai, Maharashtra 400001',
      createdAt: '2024-01-25T12:00:00Z'
    },
    {
      id: 'INV002',
      invoiceNumber: 'INV-2024-002',
      orderNumber: 'ORD-2024-002',
      customerName: 'XYZ Industries',
      poNumber: 'PO-XYZ-002',
      invoiceDate: '2024-01-26',
      dueDate: '2024-02-25',
      totalAmount: 500000,
      taxAmount: 90000,
      status: 'paid',
      paymentTerms: 'Net 30',
      paymentMethod: 'Cheque',
      billingAddress: '456 Industrial Area, Delhi, Delhi 110001',
      createdAt: '2024-01-26T15:20:00Z'
    },
    {
      id: 'INV003',
      invoiceNumber: 'INV-2024-003',
      orderNumber: 'ORD-2024-003',
      customerName: 'Tech Solutions Ltd',
      poNumber: 'PO-TSL-003',
      invoiceDate: '2024-01-20',
      dueDate: '2024-01-25',
      totalAmount: 150000,
      taxAmount: 27000,
      status: 'overdue',
      paymentTerms: 'Net 15',
      paymentMethod: 'Online Payment',
      billingAddress: '789 Tech Hub, Bangalore, Karnataka 560001',
      createdAt: '2024-01-20T10:30:00Z'
    }
  ];

  // Sample Returns
  const returns = [
    {
      id: 'RET001',
      returnNumber: 'RET-2024-001',
      orderNumber: 'ORD-2024-001',
      invoiceNumber: 'INV-2024-001',
      customerName: 'ABC Corporation',
      requestDate: '2024-01-30',
      itemsCount: 1,
      returnType: 'defective',
      reason: 'Product arrived damaged during shipping',
      status: 'requested',
      resolutionType: 'Replacement',
      refundAmount: null,
      expectedResolution: '2024-02-05',
      createdAt: '2024-01-30T13:15:00Z'
    },
    {
      id: 'RET002',
      returnNumber: 'RET-2024-002',
      orderNumber: 'ORD-2024-002',
      invoiceNumber: 'INV-2024-002',
      customerName: 'XYZ Industries',
      requestDate: '2024-01-28',
      itemsCount: 2,
      returnType: 'wrong_item',
      reason: 'Received different model than ordered',
      status: 'processing',
      resolutionType: 'Exchange',
      refundAmount: null,
      expectedResolution: '2024-02-03',
      createdAt: '2024-01-28T09:45:00Z'
    },
    {
      id: 'RET003',
      returnNumber: 'RET-2024-003',
      orderNumber: 'ORD-2024-003',
      invoiceNumber: 'INV-2024-003',
      customerName: 'Tech Solutions Ltd',
      requestDate: '2024-01-26',
      itemsCount: 1,
      returnType: 'changed_mind',
      reason: 'Customer no longer needs the service',
      status: 'approved',
      resolutionType: 'Refund',
      refundAmount: 75000,
      expectedResolution: '2024-02-01',
      createdAt: '2024-01-26T16:00:00Z'
    }
  ];

  // Store data in localStorage
  localStorage.setItem('customers', JSON.stringify(customers));
  localStorage.setItem('quotations', JSON.stringify(quotations));
  localStorage.setItem('dispatches', JSON.stringify(dispatches));
  localStorage.setItem('invoices', JSON.stringify(invoices));
  localStorage.setItem('returns', JSON.stringify(returns));

  console.log('Sample data generated successfully!');
  console.log('- Customers:', customers.length);
  console.log('- Quotations:', quotations.length);
  console.log('- Dispatches:', dispatches.length);
  console.log('- Invoices:', invoices.length);
  console.log('- Returns:', returns.length);
  console.log('Navigate to the Sales module to see the data in action!');
};

// Run the function if this script is executed directly
if (typeof window !== 'undefined') {
  generateSampleData();
}

export default generateSampleData;
