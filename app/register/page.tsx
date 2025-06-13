/**
 * Página de registro
 * Interface para criação de novas contas
 */

"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Check, Github, Mail, Eye, EyeOff, User, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useRegister } from "@/hooks/useAuth";
import { Metadata } from 'next'
import { Suspense } from 'react'
import RegisterForm from '../../components/auth/register-form'

// AnimatedGradientBackground Component
const AnimatedGradientBackground: React.FC<{
  startingGap?: number;
  breathing?: boolean;
  gradientColors?: string[];
  gradientStops?: number[];
  animationSpeed?: number;
  breathingRange?: number;
  containerStyle?: React.CSSProperties;
  containerClassName?: string;
  topOffset?: number;
}> = ({
  startingGap = 125,
  breathing = true,
  gradientColors = [
    "#FF6D00", // laranja SynapScale (centro)
    "#FFA040", // laranja claro (transição)
    "#0A0A0A"  // preto (bordas)
  ],
  gradientStops = [0, 40, 100],
  animationSpeed = 0.02,
  breathingRange = 5,
  containerStyle = {},
  topOffset = 0,
  containerClassName = "",
}) => {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  React.useEffect(() => {
    let animationFrame: number;
    let width = startingGap;
    let directionWidth = 1;
    const animateGradient = () => {
      if (width >= startingGap + breathingRange) directionWidth = -1;
      if (width <= startingGap - breathingRange) directionWidth = 1;
      if (!breathing) directionWidth = 0;
      width += directionWidth * animationSpeed;
      const gradientStopsString = gradientStops
        .map((stop, index) => `${gradientColors[index]} ${stop}%`)
        .join(", ");
      const gradient = `radial-gradient(${width}% ${width+topOffset}% at 50% 20%, ${gradientStopsString})`;
      if (containerRef.current) {
        containerRef.current.style.background = gradient;
      }
      animationFrame = requestAnimationFrame(animateGradient);
    };
    animationFrame = requestAnimationFrame(animateGradient);
    return () => cancelAnimationFrame(animationFrame);
  }, [startingGap, breathing, gradientColors, gradientStops, animationSpeed, breathingRange, topOffset]);
  return (
    <motion.div
      key="animated-gradient-background"
      initial={{ opacity: 0, scale: 1.5 }}
      animate={{ opacity: 1, scale: 1, transition: { duration: 2, ease: [0.25, 0.1, 0.25, 1] } }}
      className={`absolute inset-0 overflow-hidden ${containerClassName}`}
    >
      <div ref={containerRef} style={containerStyle} className="absolute inset-0 transition-transform" />
    </motion.div>
  );
};

// BGPattern Component
type BGVariantType = 'dots' | 'diagonal-stripes' | 'grid' | 'horizontal-lines' | 'vertical-lines' | 'checkerboard';
type BGMaskType =
  | 'fade-center'
  | 'fade-edges'
  | 'fade-top'
  | 'fade-bottom'
  | 'fade-left'
  | 'fade-right'
  | 'fade-x'
  | 'fade-y'
  | 'none';

const maskClasses: Record<BGMaskType, string> = {
  'fade-edges': '[mask-image:radial-gradient(ellipse_at_center,var(--background),transparent)]',
  'fade-center': '[mask-image:radial-gradient(ellipse_at_center,transparent,var(--background))]',
  'fade-top': '[mask-image:linear-gradient(to_bottom,transparent,var(--background))]',
  'fade-bottom': '[mask-image:linear-gradient(to_bottom,var(--background),transparent)]',
  'fade-left': '[mask-image:linear-gradient(to_right,transparent,var(--background))]',
  'fade-right': '[mask-image:linear-gradient(to_right,var(--background),transparent)]',
  'fade-x': '[mask-image:linear-gradient(to_right,transparent,var(--background),transparent)]',
  'fade-y': '[mask-image:linear-gradient(to_bottom,transparent,var(--background),transparent)]',
  none: '',
};

function getBgImage(variant: BGVariantType, fill: string, size: number) {
  switch (variant) {
    case 'dots':
      return `radial-gradient(${fill} 1px, transparent 1px)`;
    case 'grid':
      return `linear-gradient(to right, ${fill} 1px, transparent 1px), linear-gradient(to bottom, ${fill} 1px, transparent 1px)`;
    case 'diagonal-stripes':
      return `repeating-linear-gradient(45deg, ${fill}, ${fill} 1px, transparent 1px, transparent ${size}px)`;
    case 'horizontal-lines':
      return `linear-gradient(to bottom, ${fill} 1px, transparent 1px)`;
    case 'vertical-lines':
      return `linear-gradient(to right, ${fill} 1px, transparent 1px)`;
    case 'checkerboard':
      return `linear-gradient(45deg, ${fill} 25%, transparent 25%), linear-gradient(-45deg, ${fill} 25%, transparent 25%), linear-gradient(45deg, transparent 75%, ${fill} 75%), linear-gradient(-45deg, transparent 75%, ${fill} 75%)`;
    default:
      return undefined;
  }
}

interface BGPatternProps extends React.ComponentProps<'div'> {
  variant?: BGVariantType;
  mask?: BGMaskType;
  size?: number;
  fill?: string;
  className?: string;
  style?: React.CSSProperties;
}

const BGPattern: React.FC<BGPatternProps> = ({
  variant = 'dots',
  mask = 'fade-edges',
  size = 32,
  fill = 'rgba(255,109,0,0.12)', // laranja SynapScale translúcido
  className,
  style,
  ...props
}) => {
  const bgSize = `${size}px ${size}px`;
  const backgroundImage = getBgImage(variant, fill, size);
  return (
    <div
      className={cn('absolute inset-0 z-[-10] size-full', maskClasses[mask], className)}
      style={{ backgroundImage, backgroundSize: bgSize, ...style }}
      {...props}
    />
  );
};

// Feature Item Component
interface FeatureItemProps {
  title: string;
  description: string;
  index: number;
}

const FeatureItem: React.FC<FeatureItemProps> = ({ title, description, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
      className="flex items-start gap-4"
    >
      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center mt-1">
        <Check className="w-4 h-4 text-primary" />
      </div>
      <div>
        <h3 className="font-semibold text-black mb-1">{title}</h3>
        <p className="text-sm text-gray-800">{description}</p>
      </div>
    </motion.div>
  );
};

// Form Input Component
interface FormInputProps {
  id: string;
  name: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label: string;
  icon: React.ReactNode;
  error?: string;
  showPassword?: boolean;
  togglePassword?: () => void;
  autoComplete?: string;
}

const FormInput: React.FC<FormInputProps> = ({
  id,
  name,
  type,
  placeholder,
  value,
  onChange,
  label,
  icon,
  error,
  showPassword,
  togglePassword,
  autoComplete,
}) => {
  return (
    <div>
      <Label htmlFor={id} className="text-foreground">{label}</Label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
          {icon}
        </div>
        <Input
          id={id}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={cn(
            "pl-10 bg-background/50 border-border/50 focus:border-primary",
            togglePassword && "pr-10"
          )}
          required
          autoComplete={autoComplete}
        />
        {togglePassword && (
          <button
            type="button"
            onClick={togglePassword}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading, error, clearError } = useRegister();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Validation logic
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) {
      errors.name = "Nome é obrigatório";
    } else if (formData.name.trim().length < 2) {
      errors.name = "Nome deve ter pelo menos 2 caracteres";
    }
    if (!formData.email) {
      errors.email = "Email é obrigatório";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Email inválido";
    }
    if (!formData.password) {
      errors.password = "Senha é obrigatória";
    } else if (formData.password.length < 8) {
      errors.password = "Senha deve ter pelo menos 8 caracteres";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      errors.password = "Senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número";
    }
    if (!formData.confirmPassword) {
      errors.confirmPassword = "Confirmação de senha é obrigatória";
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Senhas não coincidem";
    }
    if (!formData.acceptTerms) {
      errors.acceptTerms = "Você deve aceitar os termos de uso";
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (error) clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      await register(formData);
      router.push("/");
    } catch (err) {
      // error handled by hook
    }
  };

  // Features list
  const features = [
    { title: "Acesso completo", description: "Todas as funcionalidades premium incluídas" },
    { title: "Suporte 24/7", description: "Equipe especializada sempre disponível" },
    { title: "Segurança avançada", description: "Seus dados protegidos com criptografia" },
    { title: "Atualizações gratuitas", description: "Novas funcionalidades sem custo adicional" },
    { title: "Integração fácil", description: "Conecte com suas ferramentas favoritas" },
    { title: "Analytics detalhado", description: "Relatórios completos do seu progresso" },
  ];

  return (
    <div className="relative overflow-hidden min-h-screen w-full bg-white text-black">
      <div className="fixed top-6 left-8 z-50 flex items-center gap-3">
        <img src="/logo.svg" alt="Logo" className="h-10 w-10" />
        <span className="text-2xl font-bold text-black">SynapScale</span>
      </div>
      <div className="relative z-30 min-h-screen flex flex-col lg:flex-row">
        {/* Left Side - Benefits */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-12 xl:px-20">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-lg"
          >
            <div className="mb-8">
              <Badge variant="outline" className="mb-4 bg-primary/20 text-primary border-primary/30 px-3 py-1">
                Plataforma
              </Badge>
              <h2 className="text-4xl font-bold text-black mb-4">
                Transforme seu negócio
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                Junte-se a mais de 10.000 empresas que já revolucionaram seus processos com nossa plataforma.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-6">
              {features.map((feature, index) => (
                <FeatureItem 
                  key={index}
                  title={feature.title}
                  description={feature.description}
                  index={index}
                />
              ))}
            </div>
          </motion.div>
        </div>
        {/* Right Side - Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-4 py-12 min-h-[60vh]">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="w-full max-w-md"
          >
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-[0_8px_32px_0_rgba(0,0,0,0.10),0_0_0_1px_rgba(255,109,0,0.10)] border-2 border-primary/30" 
                 style={{ boxShadow: '0 8px 32px 0 rgba(0,0,0,0.25), 0 0 0 1px rgba(255,109,0,0.1)' }}>
              {/* Mobile Logo */}
              <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
                <img
                  src="/logo.svg"
                  alt="Logo"
                  className="h-8 w-8"
                />
                <h1 className="text-xl font-bold text-black">SynapScale</h1>
              </div>
              {/* Form Header */}
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-black mb-2">Crie sua conta</h2>
                <p className="text-gray-700">Junte-se a milhares de usuários que já transformaram seu negócio</p>
              </div>
              {/* Registration Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-4">
                  <FormInput
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Seu nome completo"
                    value={formData.name}
                    onChange={handleInputChange}
                    label="Nome completo"
                    icon={<User className="w-4 h-4" />}
                    error={validationErrors.name}
                    autoComplete="name"
                  />
                  <FormInput
                    id="email"
                    name="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    label="Email"
                    icon={<Mail className="w-4 h-4" />}
                    error={validationErrors.email}
                    autoComplete="email"
                  />
                  <FormInput
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleInputChange}
                    label="Senha"
                    icon={<Lock className="w-4 h-4" />}
                    error={validationErrors.password}
                    showPassword={showPassword}
                    togglePassword={() => setShowPassword(!showPassword)}
                    autoComplete="new-password"
                  />
                  <FormInput
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    label="Confirmar Senha"
                    icon={<Lock className="w-4 h-4" />}
                    error={validationErrors.confirmPassword}
                    showPassword={showConfirmPassword}
                    togglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
                    autoComplete="new-password"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      id="acceptTerms"
                      name="acceptTerms"
                      type="checkbox"
                      checked={formData.acceptTerms}
                      onChange={handleInputChange}
                      className="accent-primary h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <Label htmlFor="acceptTerms" className="text-gray-700 text-xs cursor-pointer">
                      Aceito os <a href="#" className="text-primary hover:underline">termos de uso</a> e a <a href="#" className="text-primary hover:underline">política de privacidade</a>
                    </Label>
                  </div>
                  {validationErrors.acceptTerms && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.acceptTerms}</p>
                  )}
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                      {error.message}
                    </div>
                  )}
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-12 font-medium bg-primary hover:bg-[#d45500] transition-all duration-300" 
                  disabled={isLoading}
                >
                  {isLoading ? "Criando conta..." : "Criar conta"}
                </Button>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border/50" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-gray-700">ou continue com</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="flex items-center gap-2 w-full h-12 hover:border-primary/50 transition-all duration-300"
                  >
                    <Github className="w-4 h-4" />
                    <span className="text-sm font-medium">GitHub</span>
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="flex items-center gap-2 w-full h-12 hover:border-primary/50 transition-all duration-300"
                  >
                    <Mail className="w-4 h-4" />
                    <span className="text-sm font-medium">Google</span>
                  </Button>
                </div>
                <p className="text-center text-sm text-gray-700">
                  Já tem uma conta?{' '}
                  <a href="/login" className="font-medium text-primary hover:underline">
                    Fazer login
                  </a>
                </p>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 z-40 p-6">
        <div className="text-center text-xs text-gray-700">
          © 2024 SynapScale. Todos os direitos reservados.{' '}
          <a href="#" className="hover:text-gray-700 transition-colors">Termos</a> •{' '}
          <a href="#" className="hover:text-gray-700 transition-colors">Privacidade</a>
        </div>
      </div>
    </div>
  );
}

