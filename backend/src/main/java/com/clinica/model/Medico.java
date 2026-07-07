package com.clinica.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "medico")
@EntityListeners(AuditingEntityListener.class)
public class Medico {

	@Id
	@GeneratedValue(strategy = GenerationType.UUID)
	private UUID id;

	@Column(nullable = false)
	private String nome; // ex: "Dr. João Augusto Souza"

	@Column(nullable = false)
	private LocalDate dataNascimento; // ex: "1978-03-15" (15 de março de 1978)

	@Column(nullable = false)
	private String sexo; // ex: "Masculino" / "Feminino" / "Outro"

	@Column(nullable = false)
	private String estadoCivil; // ex: "Casado" / "Solteiro" / "Divorciado"

	@Column(nullable = false, unique = true)
	private String cpf; // ex: "987.654.321-00"

	@Column(nullable = false, unique = true)
	private String crm; // ex: "12345"

	@Column(nullable = false)
	private String crmEstado; // ex: "SP" / "MG" / "RJ"

	@Column(nullable = false)
	private String especialidade; // ex: "Clínica Geral" / "Cardiologia" / "Pediatria" / "Otorrinolaringologia"

	@Column(nullable = false)
	private String telefone; // ex: "(34) 3333-4444"

	@Column(nullable = false)
	private String email; // ex: "dr.joao@clinica.com.br"

	@Column
	private String cep; // ex: "38400-100"

	@Column
	private String logradouro; // ex: "Avenida Rondon Pacheco"

	@Column
	private String numero; // ex: "4600"

	@Column
	private String complemento; // ex: "Sala 302"

	@Column
	private String bairro; // ex: "Tibery"

	@Column
	private String cidade; // ex: "Uberlândia"

	@Column
	private String uf; // ex: "MG"

	@Column(nullable = false)
	private Boolean ativo = true; // ex: true (médico ativo) / false (desligado da clínica)

	@JsonIgnore
	@OneToMany(mappedBy = "medico")
	private List<Consulta> consultas;

	@CreatedDate
	@Column(name = "data_cadastro")
	private LocalDateTime dataCadastro;

	@LastModifiedDate
	@Column(name = "data_atualizacao")
	private LocalDateTime dataAtualizacao;

	@OneToOne
	@JsonIgnore
	@JoinColumn(name = "id_usuario")
	private User usuario;

	public Medico() {}

	@JsonProperty("createdBy")
	public String getCreatedBy() {
		return usuario != null ? usuario.getUsername() : null;
	}

	@Transient
	public String getIdade() {
		if (this.dataNascimento == null) {
			return "Data não informada";
		}
		Period periodo = Period.between(this.dataNascimento, LocalDate.now());
		return periodo.getYears() + " anos, " + periodo.getMonths() + " meses e " + periodo.getDays() + " dias";
	} // ex: dataNascimento "1978-03-15" → "47 anos, 0 meses e 18 dias"

	public UUID getId() { return id; }
	public void setId(UUID id) { this.id = id; }

	public String getNome() { return nome; }
	public void setNome(String nome) { this.nome = nome; }

	public LocalDate getDataNascimento() { return dataNascimento; }
	public void setDataNascimento(LocalDate dataNascimento) { this.dataNascimento = dataNascimento; }

	public String getSexo() { return sexo; }
	public void setSexo(String sexo) { this.sexo = sexo; }

	public String getEstadoCivil() { return estadoCivil; }
	public void setEstadoCivil(String estadoCivil) { this.estadoCivil = estadoCivil; }

	public String getCpf() { return cpf; }
	public void setCpf(String cpf) { this.cpf = cpf; }

	public String getCrm() { return crm; }
	public void setCrm(String crm) { this.crm = crm; }

	public String getCrmEstado() { return crmEstado; }
	public void setCrmEstado(String crmEstado) { this.crmEstado = crmEstado; }

	public String getEspecialidade() { return especialidade; }
	public void setEspecialidade(String especialidade) { this.especialidade = especialidade; }

	public String getTelefone() { return telefone; }
	public void setTelefone(String telefone) { this.telefone = telefone; }

	public String getEmail() { return email; }
	public void setEmail(String email) { this.email = email; }

	public String getCep() { return cep; }
	public void setCep(String cep) { this.cep = cep; }

	public String getLogradouro() { return logradouro; }
	public void setLogradouro(String logradouro) { this.logradouro = logradouro; }

	public String getNumero() { return numero; }
	public void setNumero(String numero) { this.numero = numero; }

	public String getComplemento() { return complemento; }
	public void setComplemento(String complemento) { this.complemento = complemento; }

	public String getBairro() { return bairro; }
	public void setBairro(String bairro) { this.bairro = bairro; }

	public String getCidade() { return cidade; }
	public void setCidade(String cidade) { this.cidade = cidade; }

	public String getUf() { return uf; }
	public void setUf(String uf) { this.uf = uf; }

	public Boolean getAtivo() { return ativo; }
	public void setAtivo(Boolean ativo) { this.ativo = ativo; }

	public LocalDateTime getDataCadastro() { return dataCadastro; }
	public void setDataCadastro(LocalDateTime dataCadastro) { this.dataCadastro = dataCadastro; }

	public LocalDateTime getDataAtualizacao() { return dataAtualizacao; }
	public void setDataAtualizacao(LocalDateTime dataAtualizacao) { this.dataAtualizacao = dataAtualizacao; }

	public User getUsuario() { return usuario; }
	public void setUsuario(User usuario) { this.usuario = usuario; }
}
