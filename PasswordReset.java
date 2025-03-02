import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import com.dftm.model.User;
import com.dftm.repository.UserRepository;

@SpringBootApplication
public class PasswordReset {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    public static void main(String[] args) {
        SpringApplication.run(PasswordReset.class, args);
    }

    @Bean
    public CommandLineRunner resetPassword() {
        return args -> {
            if (args.length < 2) {
                System.out.println("Användning: java -jar passwordreset.jar <e-post> <nytt-lösenord>");
                return;
            }
            
            String email = args[0];
            String newPassword = args[1];
            String hashedPassword = passwordEncoder.encode(newPassword);
            
            User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Användare hittades inte: " + email));
                
            user.setPassword(hashedPassword);
            userRepository.save(user);
            
            System.out.println("Lösenord uppdaterat för användare: " + email);
        };
    }
} 