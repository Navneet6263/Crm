# Green Call CRM

A modern, AI-powered Customer Relationship Management system built for Indian businesses.

## 🚀 Features

### Core CRM Features
- **Lead Management**: Add, track, and manage leads with detailed information
- **Customer Management**: Comprehensive customer database with timeline
- **Sales Pipeline**: Visual pipeline management with status tracking
- **Analytics Dashboard**: Real-time insights and reporting
- **Task Management**: Kanban-style task organization
- **Communication Hub**: Integrated communication tools

### Advanced Features
- **AI Lead Scoring**: Intelligent lead prioritization
- **Auto Assignment**: Automatic lead distribution
- **Duplicate Detection**: Smart duplicate lead identification
- **WhatsApp Integration**: Direct messaging capabilities
- **Location Tracking**: GPS-based attendance and tracking
- **Document Management**: File storage and organization
- **Calendar Sync**: Meeting and appointment scheduling

### User Experience
- **Dark/Light Mode**: Toggle between themes
- **Responsive Design**: Works on all devices
- **Real-time Search**: Instant search across all data
- **Role-based Access**: Different permissions for different roles
- **Professional UI**: Modern, clean interface

## 🛠️ Technology Stack

### Frontend
- **React 18**: Modern React with hooks and context
- **Lucide React**: Beautiful icons
- **CSS-in-JS**: Styled components approach
- **Lazy Loading**: Optimized performance

### Backend Integration
- **REST API**: RESTful API integration
- **Mock Data**: Development-friendly mock data
- **Error Handling**: Comprehensive error management
- **Authentication**: JWT-based authentication

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd green-call-crm
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start development server**
   ```bash
   npm start
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

## 🔧 Configuration

### Environment Variables
```env
REACT_APP_API_BASE_URL=http://localhost:5000/api
REACT_APP_ENABLE_MOCK_DATA=true
REACT_APP_VERSION=1.0.0
```

### API Configuration
Update `src/config.js` with your backend API settings:
```javascript
const config = {
  api: {
    baseUrl: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api'
  },
  features: {
    useMockData: process.env.REACT_APP_ENABLE_MOCK_DATA === 'true'
  }
};
```

## 👥 User Roles

### Super Admin
- Full system access
- User management
- System configuration
- All CRM features

### Admin
- Lead management
- Customer management
- Analytics access
- Team management

### Sales Manager
- Lead assignment
- Team performance tracking
- Pipeline management
- Reporting

### Sales Rep
- Personal leads
- Customer interaction
- Basic reporting
- Task management

## 🎯 Usage

### Getting Started
1. **Sign Up**: Create a new account or sign in
2. **Add Leads**: Start by adding your first lead
3. **Assign Leads**: Distribute leads to team members
4. **Track Progress**: Monitor pipeline and conversions
5. **Analyze Performance**: Use analytics for insights

### Key Workflows
- **Lead to Customer**: Lead → Qualified → Proposal → Closed
- **Team Collaboration**: Assign → Follow-up → Update → Close
- **Performance Tracking**: Analytics → Reports → Optimization

## 🔍 Testing

### Manual Testing Checklist
- [ ] User authentication (Sign up/Sign in)
- [ ] Lead creation and management
- [ ] Lead assignment functionality
- [ ] Search and filtering
- [ ] Dark/Light mode toggle
- [ ] Responsive design
- [ ] Navigation between pages
- [ ] API error handling

### Browser Compatibility
- Chrome (recommended)
- Firefox
- Safari
- Edge

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Deployment Options
- **Netlify**: Connect GitHub repo for auto-deployment
- **Vercel**: Zero-config deployment
- **AWS S3**: Static website hosting
- **Traditional Hosting**: Upload build folder

### Environment Setup
1. Set production environment variables
2. Configure API endpoints
3. Enable production optimizations
4. Set up monitoring and analytics

## 📱 Mobile Support

The application is fully responsive and works on:
- Mobile phones (iOS/Android)
- Tablets
- Desktop computers
- Large displays

## 🔒 Security Features

- JWT-based authentication
- Role-based access control
- Input validation and sanitization
- Secure API communication
- Data encryption in transit

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For support and questions:
- Email: support@greencallcrm.com
- Phone: +91 1234567890
- Documentation: [Link to docs]

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- React team for the amazing framework
- Lucide for beautiful icons
- Open source community for inspiration

---

**Green Call CRM** - Empowering Indian businesses with intelligent customer relationship management.

“🔒 Source code available upon request (private repository).”
navneetkumar6263101@gmail.com