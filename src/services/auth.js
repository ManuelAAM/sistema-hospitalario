import { getUserByUsername, createUser, getUserByEmail, updateLastLogin } from './database';

// Simple hash function using Web Crypto API
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

// Verify password
async function verifyPassword(password, hash) {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
}

// Login function
export async function login(username, password) {
  try {
    console.log('🔐 Attempting login for user:', username);
    
    // Get user from database
    const user = await getUserByUsername(username);
    console.log('👤 User lookup result:', user ? 'Found' : 'Not found');
    
    if (!user) {
      console.error('❌ User not found:', username);
      throw new Error('Usuario no encontrado');
    }

    // Check if user is active
    if (user.is_active === 0) {
      console.error('❌ User account is inactive:', username);
      throw new Error('Esta cuenta ha sido desactivada');
    }

    console.log('🔑 Verifying password...');
    // Verify password
    const isValid = await verifyPassword(password, user.password_hash);
    console.log('✅ Password verification:', isValid ? 'Success' : 'Failed');
    
    if (!isValid) {
      console.error('❌ Invalid password for user:', username);
      throw new Error('Contraseña incorrecta');
    }

    // Update last login
    await updateLastLogin(user.id);
    console.log('✅ Login successful for user:', username, '- Role:', user.role);

    // Return user data (without password hash)
    return {
      id: user.id,
      username: user.username,
      role: user.role,
      name: user.name,
      email: user.email,
      phone: user.phone,
      department: user.department,
      specialization: user.specialization
    };
  } catch (error) {
    console.error('❌ Login error:', error);
    console.error('Error stack:', error.stack);
    throw error;
  }
}

// Register new user
export async function register(userData) {
  try {
    // Check if username already exists
    const existingUser = await getUserByUsername(userData.username);
    
    if (existingUser) {
      throw new Error('El nombre de usuario ya está en uso');
    }

    // Check if email already exists
    if (userData.email) {
      const existingEmail = await getUserByEmail(userData.email);
      if (existingEmail) {
        throw new Error('El correo electrónico ya está registrado');
      }
    }

    // Validate password strength
    if (userData.password.length < 6) {
      throw new Error('La contraseña debe tener al menos 6 caracteres');
    }

    // Hash password
    const passwordHash = await hashPassword(userData.password);

    // Create user
    await createUser({
      username: userData.username,
      password_hash: passwordHash,
      role: userData.role || 'patient',
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      license_number: userData.licenseNumber || null
    });

    console.log('User registered successfully');
    return { success: true };
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
}

// Create default users if they don't exist
export async function createDefaultUsers() {
  try {
    // Check if admin user exists
    const adminExists = await getUserByUsername('admin');
    if (!adminExists) {
      await register({
        username: 'admin',
        password: 'admin123',
        role: 'admin',
        name: 'Administrador',
        email: 'admin@hospital.com'
      });
      console.log('✓ Default admin user created (username: admin, password: admin123)');
    }

    // Create default nurse user
    const nurseExists = await getUserByUsername('enfermero');
    if (!nurseExists) {
      await register({
        username: 'enfermero',
        password: 'enfermero123',
        role: 'nurse',
        name: 'Enfermero Juan López',
        email: 'enfermero@hospital.com',
        licenseNumber: '1234567'
      });
      console.log('✓ Default nurse user created (username: enfermero, password: enfermero123, license: 1234567)');
    }

    // Create default patient user
    const patientExists = await getUserByUsername('paciente');
    if (!patientExists) {
      await register({
        username: 'paciente',
        password: 'paciente123',
        role: 'patient',
        name: 'Juan Pérez',
        email: 'paciente@hospital.com'
      });
      console.log('✓ Default patient user created (username: paciente, password: paciente123)');
    }
  } catch (error) {
    console.error('Error creating default users:', error);
  }
}

// Logout function (clears session)
export function logout() {
  // In a real app, this would clear tokens/sessions
  console.log('User logged out');
  return { success: true };
}

// Change password function
export async function changePassword(userId, oldPassword, newPassword) {
  try {
    // Import dynamic to avoid circular dependency
    const { getUserById, updateUserPassword } = await import('./database');
    
    // Get user
    const user = await getUserById(userId);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // Get full user with password hash
    const { getUserByUsername } = await import('./database');
    const fullUser = await getUserByUsername(user.username);

    // Verify old password
    const isValid = await verifyPassword(oldPassword, fullUser.password_hash);
    if (!isValid) {
      throw new Error('Contraseña actual incorrecta');
    }

    // Validate new password
    if (newPassword.length < 6) {
      throw new Error('La nueva contraseña debe tener al menos 6 caracteres');
    }

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);

    // Update password
    await updateUserPassword(userId, newPasswordHash);

    console.log('Password changed successfully');
    return { success: true };
  } catch (error) {
    console.error('Change password error:', error);
    throw error;
  }
}

// Request password reset
export async function requestPasswordReset(email) {
  try {
    const { getUserByEmail, createPasswordResetToken } = await import('./database');
    
    // Find user by email
    const user = await getUserByEmail(email);
    if (!user) {
      // Don't reveal if email exists
      return { success: true, message: 'Si el correo existe, recibirás instrucciones' };
    }

    // Generate reset token
    const token = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // Token expires in 1 hour

    // Save token
    await createPasswordResetToken(user.id, token, expiresAt.toISOString());

    // In a real app, send email with token
    console.log('Password reset token:', token);
    
    return { success: true, token, message: 'Token de recuperación generado' };
  } catch (error) {
    console.error('Request password reset error:', error);
    throw error;
  }
}

// Reset password with token
export async function resetPasswordWithToken(token, newPassword) {
  try {
    const { getPasswordResetToken, getUserById, updateUserPassword, markTokenAsUsed } = await import('./database');
    
    // Validate token
    const resetToken = await getPasswordResetToken(token);
    if (!resetToken) {
      throw new Error('Token inválido o ya utilizado');
    }

    // Check if token is expired
    const now = new Date();
    const expiresAt = new Date(resetToken.expires_at);
    if (now > expiresAt) {
      throw new Error('El token ha expirado');
    }

    // Validate new password
    if (newPassword.length < 6) {
      throw new Error('La contraseña debe tener al menos 6 caracteres');
    }

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);

    // Update password
    await updateUserPassword(resetToken.user_id, newPasswordHash);

    // Mark token as used
    await markTokenAsUsed(token);

    console.log('Password reset successfully');
    return { success: true };
  } catch (error) {
    console.error('Reset password error:', error);
    throw error;
  }
}

// Recover password by license number (for nurses)
export async function recoverPasswordByLicense(licenseNumber, newPassword) {
  try {
    console.log('🔐 Attempting password recovery with license number');
    const { getUserByLicenseNumber, updateUserPassword } = await import('./database');
    
    // Find nurse by license number
    const user = await getUserByLicenseNumber(licenseNumber);
    
    if (!user) {
      console.error('❌ No nurse found with this license number');
      throw new Error('No se encontró un enfermero con esta cédula profesional');
    }

    // Check if user is active
    if (user.is_active === 0) {
      console.error('❌ User account is inactive');
      throw new Error('Esta cuenta ha sido desactivada');
    }

    // Validate new password
    if (!newPassword || newPassword.length < 6) {
      throw new Error('La contraseña debe tener al menos 6 caracteres');
    }

    console.log('🔑 Generating new password hash...');
    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);

    console.log('💾 Updating password in database...');
    // Update password
    await updateUserPassword(user.id, newPasswordHash);

    console.log('✅ Password recovered successfully for:', user.name);
    return { 
      success: true, 
      message: 'Contraseña actualizada exitosamente',
      username: user.username,
      name: user.name
    };
  } catch (error) {
    console.error('❌ Password recovery error:', error);
    throw error;
  }
}

// Export hash function for testing
export { hashPassword };
