export interface CodeTemplate {
  id: string
  name: string
  description: string
  category: string
  language: "javascript" | "typescript" | "python" | "all"
  tags: string[]
  code: string
}

export const codeTemplates: CodeTemplate[] = [
  // Data Transformation Templates
  {
    id: "array-map",
    name: "Array Map Transformation",
    description: "Transform each item in an array using map function",
    category: "data-transformation",
    language: "javascript",
    tags: ["array", "map", "transform"],
    code: `// Transform each item in the array
const transformedItems = items.map(item => {
  return {
    id: item.id,
    name: item.name.toUpperCase(),
    // Add more transformations as needed
    formattedDate: new Date(item.date).toLocaleDateString(),
    // Calculate values
    total: item.quantity * item.price
  };
});

// Return the transformed array
return transformedItems;`,
  },
  {
    id: "array-filter",
    name: "Array Filter",
    description: "Filter items in an array based on conditions",
    category: "data-transformation",
    language: "javascript",
    tags: ["array", "filter", "condition"],
    code: `// Filter items based on conditions
const filteredItems = items.filter(item => {
  // Add your conditions here
  return item.price > 100 && item.inStock === true;
});

// Return the filtered array
return filteredItems;`,
  },
  {
    id: "array-reduce",
    name: "Array Reduce",
    description: "Reduce an array to a single value (sum, average, etc.)",
    category: "data-transformation",
    language: "javascript",
    tags: ["array", "reduce", "aggregate"],
    code: `// Reduce array to a single value
const total = items.reduce((sum, item) => {
  return sum + (item.price * item.quantity);
}, 0);

// Calculate average
const average = total / items.length;

return {
  total,
  average,
  count: items.length
};`,
  },
  {
    id: "object-transform",
    name: "Object Transformation",
    description: "Transform object properties and structure",
    category: "data-transformation",
    language: "javascript",
    tags: ["object", "transform", "restructure"],
    code: `// Transform object structure
const transformedObject = {
  // Pick specific properties
  id: data.id,
  // Rename properties
  fullName: data.name,
  // Transform values
  formattedDate: new Date(data.date).toLocaleDateString(),
  // Add computed properties
  isValid: data.status === 'active' && data.verified === true,
  // Nested transformations
  contact: {
    email: data.email,
    phone: data.phone || 'N/A'
  }
};

return transformedObject;`,
  },
  {
    id: "group-by",
    name: "Group Array by Property",
    description: "Group array items by a specific property",
    category: "data-transformation",
    language: "javascript",
    tags: ["array", "group", "organize"],
    code: `// Group array items by a property
const groupedItems = items.reduce((groups, item) => {
  // Define the key to group by
  const key = item.category;
  
  // Create the group if it doesn't exist
  if (!groups[key]) {
    groups[key] = [];
  }
  
  // Add the item to the group
  groups[key].push(item);
  
  return groups;
}, {});

return groupedItems;`,
  },

  // HTTP Requests Templates
  {
    id: "fetch-get",
    name: "HTTP GET Request",
    description: "Make a GET request to an API endpoint",
    category: "http-requests",
    language: "javascript",
    tags: ["http", "api", "get", "fetch"],
    code: `// Make a GET request to an API
const response = await fetch('https://api.example.com/data', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + $variables.apiToken
  }
});

// Check if the request was successful
if (!response.ok) {
  throw new Error(\`HTTP error! status: \${response.status}\`);
}

// Parse the JSON response
const data = await response.json();

return data;`,
  },
  {
    id: "fetch-post",
    name: "HTTP POST Request",
    description: "Make a POST request to an API endpoint",
    category: "http-requests",
    language: "javascript",
    tags: ["http", "api", "post", "fetch"],
    code: `// Prepare the data to send
const payload = {
  name: items[0].name,
  email: items[0].email,
  // Add more fields as needed
};

// Make a POST request to an API
const response = await fetch('https://api.example.com/data', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + $variables.apiToken
  },
  body: JSON.stringify(payload)
});

// Check if the request was successful
if (!response.ok) {
  throw new Error(\`HTTP error! status: \${response.status}\`);
}

// Parse the JSON response
const data = await response.json();

return data;`,
  },
  {
    id: "fetch-put",
    name: "HTTP PUT Request",
    description: "Make a PUT request to update a resource",
    category: "http-requests",
    language: "javascript",
    tags: ["http", "api", "put", "update", "fetch"],
    code: `// Prepare the data to update
const payload = {
  id: items[0].id,
  name: items[0].name,
  email: items[0].email,
  // Add more fields as needed
};

// Make a PUT request to update a resource
const response = await fetch(\`https://api.example.com/data/\${payload.id}\`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + $variables.apiToken
  },
  body: JSON.stringify(payload)
});

// Check if the request was successful
if (!response.ok) {
  throw new Error(\`HTTP error! status: \${response.status}\`);
}

// Parse the JSON response
const data = await response.json();

return data;`,
  },
  {
    id: "fetch-delete",
    name: "HTTP DELETE Request",
    description: "Make a DELETE request to remove a resource",
    category: "http-requests",
    language: "javascript",
    tags: ["http", "api", "delete", "remove", "fetch"],
    code: `// Get the ID of the resource to delete
const id = items[0].id;

// Make a DELETE request to remove a resource
const response = await fetch(\`https://api.example.com/data/\${id}\`, {
  method: 'DELETE',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + $variables.apiToken
  }
});

// Check if the request was successful
if (!response.ok) {
  throw new Error(\`HTTP error! status: \${response.status}\`);
}

// For DELETE requests, the response might be empty
// or contain a confirmation message
const result = await response.json().catch(() => ({ success: true }));

return result;`,
  },

  // Date and Time Templates
  {
    id: "date-formatting",
    name: "Date Formatting",
    description: "Format dates in various ways",
    category: "date-time",
    language: "javascript",
    tags: ["date", "format", "time"],
    code: `// Get the current date
const now = new Date();

// Format date as ISO string
const isoDate = now.toISOString();

// Format date as local date string
const localDate = now.toLocaleDateString();

// Format date as local time string
const localTime = now.toLocaleTimeString();

// Format date with options
const formattedDate = now.toLocaleDateString('en-US', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric'
});

// Custom date formatting
const year = now.getFullYear();
const month = String(now.getMonth() + 1).padStart(2, '0');
const day = String(now.getDate()).padStart(2, '0');
const customFormat = \`\${year}-\${month}-\${day}\`;

return {
  isoDate,
  localDate,
  localTime,
  formattedDate,
  customFormat
};`,
  },
  {
    id: "date-operations",
    name: "Date Operations",
    description: "Perform operations on dates (add/subtract time, compare dates)",
    category: "date-time",
    language: "javascript",
    tags: ["date", "operations", "time", "calculate"],
    code: `// Get the current date
const now = new Date();

// Add days to a date
const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

// Subtract days from a date
const subtractDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
};

// Calculate difference between dates in days
const dateDiffInDays = (date1, date2) => {
  const diffTime = Math.abs(date2 - date1);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Example usage
const tomorrow = addDays(now, 1);
const yesterday = subtractDays(now, 1);
const nextWeek = addDays(now, 7);
const lastWeek = subtractDays(now, 7);

// Calculate days between dates
const daysSinceLastWeek = dateDiffInDays(lastWeek, now);
const daysUntilNextWeek = dateDiffInDays(now, nextWeek);

return {
  now: now.toISOString(),
  tomorrow: tomorrow.toISOString(),
  yesterday: yesterday.toISOString(),
  nextWeek: nextWeek.toISOString(),
  lastWeek: lastWeek.toISOString(),
  daysSinceLastWeek,
  daysUntilNextWeek
};`,
  },

  // Error Handling Templates
  {
    id: "try-catch",
    name: "Try-Catch Error Handling",
    description: "Handle errors with try-catch blocks",
    category: "error-handling",
    language: "javascript",
    tags: ["error", "try-catch", "exception"],
    code: `// Handle errors with try-catch
try {
  // Attempt to perform an operation that might fail
  const data = JSON.parse(items[0].jsonString);
  
  // Process the data
  const result = {
    id: data.id,
    name: data.name,
    processed: true
  };
  
  return result;
} catch (error) {
  // Handle the error
  console.error('An error occurred:', error.message);
  
  // Return a fallback or error response
  return {
    error: true,
    message: error.message,
    processed: false
  };
} finally {
  // This code will run regardless of whether an error occurred
  console.log('Processing complete');
}`,
  },
  {
    id: "validation",
    name: "Input Validation",
    description: "Validate input data before processing",
    category: "error-handling",
    language: "javascript",
    tags: ["validation", "input", "check"],
    code: `// Validate input data
function validateInput(data) {
  const errors = [];
  
  // Check if required fields exist
  if (!data.name) {
    errors.push('Name is required');
  }
  
  if (!data.email) {
    errors.push('Email is required');
  } else if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(data.email)) {
    errors.push('Email is invalid');
  }
  
  // Check numeric values
  if (data.age !== undefined) {
    if (typeof data.age !== 'number') {
      errors.push('Age must be a number');
    } else if (data.age < 0 || data.age > 120) {
      errors.push('Age must be between 0 and 120');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Process the input data
const inputData = items[0];
const validation = validateInput(inputData);

if (validation.isValid) {
  // Process valid data
  return {
    success: true,
    data: inputData
  };
} else {
  // Return validation errors
  return {
    success: false,
    errors: validation.errors
  };
}`,
  },

  // File Operations Templates
  {
    id: "csv-parse",
    name: "Parse CSV Data",
    description: "Parse CSV string into structured data",
    category: "file-operations",
    language: "javascript",
    tags: ["csv", "parse", "file"],
    code: `// Parse CSV string into structured data
function parseCSV(csvString, delimiter = ',') {
  // Split the CSV string into rows
  const rows = csvString.trim().split('\\n');
  
  // Extract headers from the first row
  const headers = rows[0].split(delimiter).map(header => header.trim());
  
  // Process data rows
  const data = rows.slice(1).map(row => {
    const values = row.split(delimiter);
    const entry = {};
    
    // Map values to headers
    headers.forEach((header, index) => {
      entry[header] = values[index] ? values[index].trim() : '';
    });
    
    return entry;
  });
  
  return {
    headers,
    data
  };
}

// Example CSV data
const csvData = items[0].csvContent;

// Parse the CSV data
const parsedData = parseCSV(csvData);

return parsedData;`,
  },
  {
    id: "json-to-csv",
    name: "Convert JSON to CSV",
    description: "Convert JSON data to CSV format",
    category: "file-operations",
    language: "javascript",
    tags: ["json", "csv", "convert", "file"],
    code: `// Convert JSON data to CSV format
function jsonToCSV(jsonData, delimiter = ',') {
  // Extract headers from the first object
  const headers = Object.keys(jsonData[0]);
  
  // Create CSV header row
  const headerRow = headers.join(delimiter);
  
  // Create data rows
  const dataRows = jsonData.map(item => {
    return headers.map(header => {
      // Handle values that contain delimiters, quotes, or newlines
      const value = item[header];
      const valueStr = String(value === null || value === undefined ? '' : value);
      
      // Escape quotes and wrap in quotes if needed
      if (valueStr.includes(delimiter) || valueStr.includes('"') || valueStr.includes('\\n')) {
        return '"' + valueStr.replace(/"/g, '""') + '"';
      }
      return valueStr;
    }).join(delimiter);
  });
  
  // Combine header and data rows
  const csvString = [headerRow, ...dataRows].join('\\n');
  
  return csvString;
}

// Example JSON data
const jsonData = items;

// Convert JSON to CSV
const csvString = jsonToCSV(jsonData);

return {
  csv: csvString
};`,
  },

  // Conditional Logic Templates
  {
    id: "switch-case",
    name: "Switch Case Logic",
    description: "Handle multiple conditions with switch-case",
    category: "conditional-logic",
    language: "javascript",
    tags: ["switch", "case", "condition", "logic"],
    code: `// Get the value to switch on
const status = items[0].status;

// Process based on status using switch-case
switch (status) {
  case 'pending':
    return {
      message: 'Your order is pending approval',
      nextStep: 'Wait for approval',
      color: 'yellow'
    };
    
  case 'approved':
    return {
      message: 'Your order has been approved',
      nextStep: 'Processing will begin soon',
      color: 'green'
    };
    
  case 'processing':
    return {
      message: 'Your order is being processed',
      nextStep: 'Shipping',
      color: 'blue'
    };
    
  case 'shipped':
    return {
      message: 'Your order has been shipped',
      nextStep: 'Delivery',
      color: 'purple'
    };
    
  case 'delivered':
    return {
      message: 'Your order has been delivered',
      nextStep: 'Complete',
      color: 'green'
    };
    
  case 'cancelled':
    return {
      message: 'Your order has been cancelled',
      nextStep: 'None',
      color: 'red'
    };
    
  default:
    return {
      message: 'Unknown order status',
      nextStep: 'Contact support',
      color: 'gray'
    };
}`,
  },
  {
    id: "complex-conditions",
    name: "Complex Conditional Logic",
    description: "Handle complex conditions with nested if-else statements",
    category: "conditional-logic",
    language: "javascript",
    tags: ["if-else", "condition", "logic", "nested"],
    code: `// Get input values
const { age, income, creditScore, hasDebt } = items[0];

// Initialize result
let result = {
  approved: false,
  reason: '',
  riskLevel: '',
  interestRate: 0
};

// Primary eligibility check
if (age < 18) {
  result.reason = 'Applicant must be at least 18 years old';
} else if (creditScore < 500) {
  result.reason = 'Credit score too low';
} else {
  // Nested conditions for approved applicants
  result.approved = true;
  
  // Determine risk level and interest rate
  if (creditScore >= 750) {
    result.riskLevel = 'very low';
    result.interestRate = 3.5;
    
    // Special rate for high income and excellent credit
    if (income > 100000 && !hasDebt) {
      result.interestRate = 2.9;
    }
  } else if (creditScore >= 700) {
    result.riskLevel = 'low';
    result.interestRate = 4.5;
    
    // Adjust based on income
    if (income > 80000) {
      result.interestRate = 4.0;
    }
  } else if (creditScore >= 650) {
    result.riskLevel = 'moderate';
    result.interestRate = 5.5;
    
    // Adjust based on debt status
    if (hasDebt) {
      result.interestRate = 6.0;
    }
  } else if (creditScore >= 600) {
    result.riskLevel = 'high';
    result.interestRate = 7.5;
  } else {
    result.riskLevel = 'very high';
    result.interestRate = 9.0;
    
    // Additional check for very high risk
    if (income < 30000 || hasDebt) {
      result.approved = false;
      result.reason = 'Income too low or existing debt with low credit score';
    }
  }
}

return result;`,
  },

  // String Manipulation Templates
  {
    id: "string-operations",
    name: "String Manipulation",
    description: "Common string operations and transformations",
    category: "string-manipulation",
    language: "javascript",
    tags: ["string", "text", "manipulation"],
    code: `// Get input string
const inputString = items[0].text;

// String operations
const result = {
  // Convert to uppercase/lowercase
  uppercase: inputString.toUpperCase(),
  lowercase: inputString.toLowerCase(),
  
  // Get string length
  length: inputString.length,
  
  // Trim whitespace
  trimmed: inputString.trim(),
  
  // Split string into array
  words: inputString.split(' '),
  
  // Replace text
  replaced: inputString.replace('old', 'new'),
  
  // Check if string contains text
  contains: inputString.includes('search'),
  
  // Get substring
  substring: inputString.substring(0, 10),
  
  // Pad string
  padded: inputString.padStart(20, '-'),
  
  // Convert to title case
  titleCase: inputString.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' '),
    
  // Remove special characters
  alphanumeric: inputString.replace(/[^a-zA-Z0-9 ]/g, ''),
  
  // Count occurrences of a character
  countChar: (inputString.match(/a/g) || []).length
};

return result;`,
  },
  {
    id: "regex-patterns",
    name: "Regular Expression Patterns",
    description: "Common regex patterns for validation and extraction",
    category: "string-manipulation",
    language: "javascript",
    tags: ["regex", "pattern", "validation", "extraction"],
    code: `// Input text to process
const text = items[0].text;

// Common regex patterns
const patterns = {
  // Email validation
  email: /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/,
  
  // URL validation
  url: /^(https?:\\/\\/)?([\\da-z.-]+)\\.([a-z.]{2,6})([/\\w .-]*)*\\/?$/,
  
  // Phone number (simple)
  phone: /^\\+?[0-9]{10,14}$/,
  
  // Date (YYYY-MM-DD)
  date: /^\\d{4}-\\d{2}-\\d{2}$/,
  
  // Time (HH:MM:SS)
  time: /^\\d{2}:\\d{2}(:\\d{2})?$/,
  
  // IP address
  ip: /^\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}$/,
  
  // Password strength (min 8 chars, at least one letter and one number)
  password: /^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d]{8,}$/,
  
  // Credit card number
  creditCard: /^\\d{4}[- ]?\\d{4}[- ]?\\d{4}[- ]?\\d{4}$/,
  
  // ZIP/Postal code (US)
  zipCode: /^\\d{5}(-\\d{4})?$/,
  
  // Extract hashtags
  hashtags: /#[a-zA-Z0-9_]+/g,
  
  // Extract mentions
  mentions: /@[a-zA-Z0-9_]+/g
};

// Test the input against patterns
const results = {};

// Test validation patterns
for (const [name, pattern] of Object.entries(patterns)) {
  if (!pattern.global) {
    results[name] = pattern.test(text);
  }
}

// Extract data using global patterns
results.extractedHashtags = text.match(patterns.hashtags) || [];
results.extractedMentions = text.match(patterns.mentions) || [];

// Extract first email from text
const emailMatch = text.match(/[^\\s@]+@[^\\s@]+\\.[^\\s@]+/);
results.extractedEmail = emailMatch ? emailMatch[0] : null;

// Extract URLs
const urlMatches = text.match(/https?:\/\/[^\s]+/g);
results.extractedUrls = urlMatches || [];

return results;`,
  },

  // API Integration Templates
  {
    id: "api-pagination",
    name: "API Pagination Handler",
    description: "Handle paginated API responses",
    category: "api-integration",
    language: "javascript",
    tags: ["api", "pagination", "fetch"],
    code: `// Function to fetch all pages from a paginated API
async function fetchAllPages(baseUrl, pageParam = 'page', limitParam = 'limit', limit = 100) {
  let allResults = [];
  let currentPage = 1;
  let hasMorePages = true;
  
  // Continue fetching until no more pages
  while (hasMorePages) {
    // Construct URL with pagination parameters
    const url = new URL(baseUrl);
    url.searchParams.set(pageParam, currentPage);
    url.searchParams.set(limitParam, limit);
    
    // Fetch current page
    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': 'Bearer ' + $variables.apiToken,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(\`API request failed with status \${response.status}\`);
    }
    
    const data = await response.json();
    
    // Add results from current page
    if (Array.isArray(data.results)) {
      allResults = [...allResults, ...data.results];
    } else if (Array.isArray(data.data)) {
      allResults = [...allResults, ...data.data];
    } else if (Array.isArray(data)) {
      allResults = [...allResults, ...data];
    }
    
    // Check if there are more pages
    hasMorePages = false;
    
    // Different APIs indicate more pages in different ways
    if (data.next || data.hasMore || data.has_more || currentPage < data.totalPages) {
      hasMorePages = true;
      currentPage++;
    }
    
    // Safety check to prevent infinite loops
    if (currentPage > 100) {
      console.warn('Reached maximum number of pages (100), stopping pagination');
      break;
    }
  }
  
  return allResults;
}

// Example usage
const apiUrl = 'https://api.example.com/data';
const allData = await fetchAllPages(apiUrl);

return {
  totalItems: allData.length,
  items: allData
};`,
  },
  {
    id: "api-authentication",
    name: "API Authentication",
    description: "Handle different API authentication methods",
    category: "api-integration",
    language: "javascript",
    tags: ["api", "authentication", "oauth", "token"],
    code: `// Function to handle different API authentication methods
async function authenticatedRequest(url, method = 'GET', data = null, authType = 'bearer') {
  // Prepare request options
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json'
    }
  };
  
  // Add authentication based on type
  switch (authType.toLowerCase()) {
    case 'bearer':
      // Bearer token authentication
      options.headers['Authorization'] = \`Bearer \${$variables.apiToken}\`;
      break;
      
    case 'basic':
      // Basic authentication
      const credentials = btoa(\`\${$variables.apiUsername}:\${$variables.apiPassword}\`);
      options.headers['Authorization'] = \`Basic \${credentials}\`;
      break;
      
    case 'apikey':
      // API key in header
      options.headers['X-API-Key'] = $variables.apiKey;
      break;
      
    case 'apikey-query':
      // API key in query parameter
      const urlWithKey = new URL(url);
      urlWithKey.searchParams.append('api_key', $variables.apiKey);
      url = urlWithKey.toString();
      break;
      
    default:
      // No authentication
      console.warn('No authentication method specified');
  }
  
  // Add request body for non-GET requests
  if (data && method !== 'GET') {
    options.body = JSON.stringify(data);
  }
  
  // Make the request
  const response = await fetch(url, options);
  
  // Handle response
  if (!response.ok) {
    throw new Error(\`API request failed with status \${response.status}: \${await response.text()}\`);
  }
  
  // Parse and return JSON response
  return await response.json();
}

// Example usage
const apiUrl = 'https://api.example.com/data';
const result = await authenticatedRequest(
  apiUrl,
  'POST',
  { name: 'Test', value: 123 },
  'bearer'
);

return result;`,
  },

  // Python Templates
  {
    id: "python-data-transform",
    name: "Python Data Transformation",
    description: "Transform data using Python",
    category: "data-transformation",
    language: "python",
    tags: ["python", "transform", "data"],
    code: `# Transform data using Python
def transform_data(items):
    # Map transformation
    transformed = []
    for item in items:
        transformed.append({
            'id': item['id'],
            'name': item['name'].upper(),
            'price_with_tax': item['price'] * 1.1,
            'is_expensive': item['price'] > 100
        })
    
    # Filter items
    expensive_items = [item for item in transformed if item['is_expensive']]
    
    # Calculate totals
    total_price = sum(item['price_with_tax'] for item in transformed)
    average_price = total_price / len(transformed) if transformed else 0
    
    return {
        'items': transformed,
        'expensive_items': expensive_items,
        'total_price': total_price,
        'average_price': average_price,
        'count': len(transformed)
    }

# Process the input data
result = transform_data(items)

return result`,
  },
  {
    id: "python-data-analysis",
    name: "Python Data Analysis",
    description: "Analyze data with Python",
    category: "data-analysis",
    language: "python",
    tags: ["python", "analysis", "statistics"],
    code: `# Analyze data with Python
def analyze_data(items):
    # Extract numeric values
    values = [item['value'] for item in items if 'value' in item]
    
    if not values:
        return {'error': 'No numeric values found in data'}
    
    # Calculate statistics
    count = len(values)
    total = sum(values)
    average = total / count
    minimum = min(values)
    maximum = max(values)
    
    # Calculate median
    sorted_values = sorted(values)
    middle = count // 2
    if count % 2 == 0:
        median = (sorted_values[middle - 1] + sorted_values[middle]) / 2
    else:
        median = sorted_values[middle]
    
    # Calculate variance and standard deviation
    variance = sum((x - average) ** 2 for x in values) / count
    std_deviation = variance ** 0.5
    
    # Find mode (most common value)
    value_counts = {}
    for value in values:
        value_counts[value] = value_counts.get(value, 0) + 1
    
    mode = max(value_counts.items(), key=lambda x: x[1])[0]
    
    return {
        'count': count,
        'sum': total,
        'average': average,
        'median': median,
        'mode': mode,
        'min': minimum,
        'max': maximum,
        'range': maximum - minimum,
        'variance': variance,
        'std_deviation': std_deviation
    }

# Process the input data
result = analyze_data(items)

return result`,
  },
]
