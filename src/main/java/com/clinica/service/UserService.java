package com.clinica.service;

import com.clinica.dto.UserCreateDTO;
import com.clinica.dto.UserDTO;
import com.clinica.dto.resposta.MedicoConsultaDTO;
import com.clinica.dto.update.UserUpdateDTO;
import com.clinica.exception.EntidadeNaoEncontradaException;
import com.clinica.exception.RegraDeNegocioException;
import com.clinica.model.Medico;
import com.clinica.model.User;
import com.clinica.model.enums.Role;
import com.clinica.repository.MedicoRepository;
import com.clinica.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class UserService {

    @Autowired
    private UserRepository repository;
    @Autowired
    private PasswordEncoder encoder;
    @Autowired
    private MedicoRepository medicoRepository;

    @Transactional
    public UserDTO insert(UserCreateDTO dto){

        if (repository.findByUsername(dto.username()).isPresent()){
            throw new RegraDeNegocioException("Username já em uso");
        }

        User user = new User();
        user.setUsername(dto.username());
        user.setSenha(encoder.encode(dto.senha()));
        user.setRole(dto.role());
        user.setAtivo(true);

        if (dto.role() == Role.MEDICO) {
            if (dto.medicoId() == null) {
                throw new RegraDeNegocioException("Médico é obrigatório para usuários com role MEDICO");
            }
            Medico medico = medicoRepository.findById(dto.medicoId())
                    .orElseThrow(() -> new EntidadeNaoEncontradaException("Médico não encontrado"));
            if (!medico.getAtivo()) {
                throw new RegraDeNegocioException("Médico desativado");
            }
            user.setMedico(medico);
        } else {
            user.setMedico(null);
        }

        return converterParaDTO(repository.save(user));
    }

    public UserDTO findByUsername(String username){
        User user = findEntityByUsername(username);
        return converterParaDTO(user);
    }

    public User findEntityByUsername(String username){
        return repository.findByUsername(username)
                .orElseThrow(() -> new EntidadeNaoEncontradaException("Usuário não encontrado"));
    }

    public List<UserDTO> findAll(){
        return repository.findAll()
                .stream()
                .map(this::converterParaDTO)
                .collect(Collectors.toList());
    }

    public UserDTO patch(UUID id, UserUpdateDTO dto){
        User user = repository.findById(id)
                .orElseThrow(() -> new EntidadeNaoEncontradaException("Usuário não encontrado"));
        if(dto.username() != null){
            user.setUsername(dto.username());
        }
        if(dto.senha() != null && !dto.senha().isBlank()){
            user.setSenha(encoder.encode(dto.senha()));
        }
        if(dto.role() != null){
            user.setRole(Role.valueOf(dto.role()));
        }
        if (dto.medico() != null && dto.medico().id() != null) {
            if (user.getRole() == Role.MEDICO) {
                Medico medicoVinculado = medicoRepository.findById(dto.medico().id())
                        .orElseThrow(() -> new EntidadeNaoEncontradaException("Médico não encontrado"));

                user.setMedico(medicoVinculado);
            }
            if(user.getRole() == Role.MEDICO){
                Medico medico = medicoRepository.findById(dto.medico().id())
                        .orElseThrow(() -> new EntidadeNaoEncontradaException("Médico não encontrado"));
                if(medico.getAtivo() != true){
                    throw new RegraDeNegocioException("Médico desativado");
                }
            }
        }
        if (user.getRole() != Role.MEDICO) {
            user.setMedico(null);
        }

        repository.save(user);

        return converterParaDTO(user);
    }

    public UserDTO delete(UUID id){
        User user = repository.findById(id)
                .orElseThrow(() -> new EntidadeNaoEncontradaException("Usuário não encontrado"));

        if(user.getRole() == Role.MEDICO){
            Medico medico = medicoRepository.findById(user.getMedico().getId())
                    .orElseThrow(() -> new EntidadeNaoEncontradaException("Médico não encontrado"));
            medico.setAtivo(false);
            medicoRepository.save(medico);
        }

        user.setAtivo(false);
        repository.save(user);

        return converterParaDTO(user);
    }

    public UserDTO converterParaDTO(User user) {
        if (user == null) return null;

        // Converte o médico de forma segura, sem carregar listas ou o usuário de volta
        MedicoConsultaDTO medicoDTO = null;
        if (user.getMedico() != null) {
            medicoDTO = new MedicoConsultaDTO(
                    user.getMedico().getId(),
                    user.getMedico().getNome(),
                    user.getMedico().getCrm(),
                    user.getMedico().getEspecialidade()
            );
        }

        return new UserDTO(
                user.getId(),
                user.getUsername(),
                user.getRole(),
                medicoDTO,
                user.getAtivo()
        );
    }

}
