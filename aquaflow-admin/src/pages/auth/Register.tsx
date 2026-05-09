import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, Form, Input, Button, message, Typography, Space } from 'antd';
import { User, Lock, Mail, Droplets, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';

const { Title, Text } = Typography;

export const RegisterPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            full_name: values.fullName,
          },
        },
      });

      if (error) throw error;

      message.success('Registration successful! Please check your email for verification.');
      navigate('/login');
    } catch (error: any) {
      console.error('Registration error:', error);
      message.error(error.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-100/50 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-blue-200/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[440px] z-10"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl shadow-xl shadow-blue-200 mb-6 group hover:scale-110 transition-transform duration-300">
            <Droplets className="w-8 h-8 text-white group-hover:animate-bounce" />
          </div>
          <Title level={2} className="!mb-1 !font-black tracking-tight text-slate-900">Create Account</Title>
          <Text className="text-slate-500 font-medium text-base">Join AquaFlow Admin Portal</Text>
        </div>

        <Card className="shadow-2xl border-none rounded-3xl overflow-hidden backdrop-blur-sm bg-white/90">
          <Form
            name="register"
            layout="vertical"
            onFinish={onFinish}
            size="large"
            autoComplete="off"
            className="mt-2"
          >
            <Form.Item
              name="fullName"
              label={<span className="text-slate-700 font-bold text-xs uppercase tracking-wider">Full Name</span>}
              rules={[{ required: true, message: 'Please input your full name!' }]}
            >
              <Input 
                prefix={<User className="w-4 h-4 text-slate-400" />} 
                placeholder="John Doe" 
                className="rounded-xl border-slate-200 hover:border-blue-400 focus:border-blue-500 h-12"
              />
            </Form.Item>

            <Form.Item
              name="email"
              label={<span className="text-slate-700 font-bold text-xs uppercase tracking-wider">Email Address</span>}
              rules={[{ required: true, message: 'Please input your email!' }, { type: 'email', message: 'Invalid email format!' }]}
            >
              <Input 
                prefix={<Mail className="w-4 h-4 text-slate-400" />} 
                placeholder="admin@aquaflow.com" 
                className="rounded-xl border-slate-200 hover:border-blue-400 focus:border-blue-500 h-12"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label={<span className="text-slate-700 font-bold text-xs uppercase tracking-wider">Password</span>}
              rules={[
                { required: true, message: 'Please input your password!' },
                { min: 6, message: 'Password must be at least 6 characters!' }
              ]}
            >
              <Input.Password
                prefix={<Lock className="w-4 h-4 text-slate-400" />}
                placeholder="••••••••"
                className="rounded-xl border-slate-200 hover:border-blue-400 focus:border-blue-500 h-12"
              />
            </Form.Item>

            <Form.Item className="mb-0 mt-6">
              <Space direction="vertical" className="w-full" size="middle">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 border-none text-base font-black shadow-lg shadow-blue-100 tracking-wide transition-all hover:scale-[1.02] active:scale-95"
                >
                  CREATE ACCOUNT
                </Button>
                <Button
                  type="default"
                  onClick={() => navigate('/dashboard')}
                  className="w-full h-12 rounded-xl border-2 border-slate-200 text-slate-600 font-bold hover:border-blue-500 hover:text-blue-500 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
                >
                  CONTINUE AS GUEST
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>

        <div className="text-center mt-8">
          <Link to="/login" className="inline-flex items-center text-slate-500 font-bold hover:text-blue-600 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Sign In
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
