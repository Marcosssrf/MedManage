package com.clinica.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
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
@Table(name = "paciente")
@EntityListeners(AuditingEntityListener.class)
public class Paciente {

	@Id
	@GeneratedValue(strategy = GenerationType.UUID)
	private UUID id;

	@Column(nullable = false)
	private String nome; // ex: "Carlos Eduardo Silva"

	@Column(nullable = false, unique = true)
	private String cpf; // ex: "123.456.789-00"

	@Column(nullable = false)
	private LocalDate dataNascimento; // ex: "1985-07-23" (23 de julho de 1985)

	@Column(nullable = false)
	private String telefone; // ex: "(34) 99876-5432"

	@Column(nullable = false)
	private String email; // ex: "carlos.silva@email.com"

	@Column(nullable = false)
	private String sexo; // ex: "Masculino" / "Feminino" / "Outro"

	@Column(nullable = false)
	private String estadoCivil; // ex: "Casado" / "Solteiro" / "Divorciado" / "Viúvo"

	@Column
	private String cep; // ex: "38400-000"

	@Column
	private String logradouro; // ex: "Rua das Flores"

	@Column
	private String numero; // ex: "245" / "S/N"

	@Column
	private String complemento; // ex: "Apto 12" / "Casa dos fundos"

	@Column
	private String bairro; // ex: "Martins"

	@Column
	private String cidade; // ex: "Uberlândia"

	@Column
	private String uf; // ex: "MG" / "SP" / "RJ"

	@ManyToOne
	@JoinColumn(name = "convenio_id")
	private Convenio convenio; // ex: referência ao convênio Unimed / Bradesco Saúde

	@Column
	private String numeroCarteirinha; // ex: "00123456789-0"

	@Column
	private LocalDate dataVencimentoCarteirinha; // ex: "2026-12-31"

	@Column(nullable = false)
	private Boolean ativo = true; // ex: true (paciente ativo) / false (inativado)

	@JsonIgnore
	@OneToMany(mappedBy = "paciente")
	private List<Consulta> consultas; // ex: lista com todas as consultas do paciente

	@OneToOne(mappedBy = "paciente", cascade = CascadeType.ALL)
	@JsonManagedReference
	private HistoricoClinico historicoClinico;

	@CreatedDate
	@Column(name = "data_cadastro")
	private LocalDateTime dataCadastro;

	@LastModifiedDate
	@Column(name = "data_atualizacao")
	private LocalDateTime dataAtualizacao;

	@ManyToOne
	@JsonIgnore
	@JoinColumn(name = "id_usuario")
	private User usuario;

	public Paciente() {
	}

	public Paciente(UUID id, String nome, String cpf, LocalDate dataNascimento, String telefone, String email,
					String sexo, String estadoCivil, String cep, String logradouro, String numero, String complemento,
					String bairro, String cidade, String uf, Convenio convenio, String numeroCarteirinha,
					LocalDate dataVencimentoCarteirinha, Boolean ativo, LocalDateTime dataCadastro,
					LocalDateTime dataAtualizacao, User usuario) {
		this.id = id;
		this.nome = nome;
		this.cpf = cpf;
		this.dataNascimento = dataNascimento;
		this.telefone = telefone;
		this.email = email;
		this.sexo = sexo;
		this.estadoCivil = estadoCivil;
		this.cep = cep;
		this.logradouro = logradouro;
		this.numero = numero;
		this.complemento = complemento;
		this.bairro = bairro;
		this.cidade = cidade;
		this.uf = uf;
		this.convenio = convenio;
		this.numeroCarteirinha = numeroCarteirinha;
		this.dataVencimentoCarteirinha = dataVencimentoCarteirinha;
		this.ativo = ativo;
		this.dataCadastro = dataCadastro;
		this.dataAtualizacao = dataAtualizacao;
		this.usuario = usuario;
	}

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
	} // ex: dataNascimento "1985-07-23" → "39 anos, 8 meses e 10 dias"

	public UUID getId() { return id; }
	public void setId(UUID id) { this.id = id; }

	public String getNome() { return nome; }
	public void setNome(String nome) { this.nome = nome; }

	public String getCpf() { return cpf; }
	public void setCpf(String cpf) { this.cpf = cpf; }

	public LocalDate getDataNascimento() { return dataNascimento; }
	public void setDataNascimento(LocalDate dataNascimento) { this.dataNascimento = dataNascimento; }

	public String getTelefone() { return telefone; }
	public void setTelefone(String telefone) { this.telefone = telefone; }

	public String getEmail() { return email; }
	public void setEmail(String email) { this.email = email; }

	public String getSexo() { return sexo; }
	public void setSexo(String sexo) { this.sexo = sexo; }

	public String getEstadoCivil() { return estadoCivil; }
	public void setEstadoCivil(String estadoCivil) { this.estadoCivil = estadoCivil; }

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

	public Convenio getConvenio() { return convenio; }
	public void setConvenio(Convenio convenio) { this.convenio = convenio; }

	public String getNumeroCarteirinha() { return numeroCarteirinha; }
	public void setNumeroCarteirinha(String numeroCarteirinha) { this.numeroCarteirinha = numeroCarteirinha; }

	public LocalDate getDataVencimentoCarteirinha() { return dataVencimentoCarteirinha; }
	public void setDataVencimentoCarteirinha(LocalDate dataVencimentoCarteirinha) { this.dataVencimentoCarteirinha = dataVencimentoCarteirinha; }

	public Boolean getAtivo() { return ativo; }
	public void setAtivo(Boolean ativo) { this.ativo = ativo; }

	public HistoricoClinico getHistoricoClinico() {
		return historicoClinico;
	}

	public void setHistoricoClinico(HistoricoClinico historicoClinico) {
		this.historicoClinico = historicoClinico;
	}

	public LocalDateTime getDataCadastro() { return dataCadastro; }
	public void setDataCadastro(LocalDateTime dataCadastro) { this.dataCadastro = dataCadastro; }

	public LocalDateTime getDataAtualizacao() { return dataAtualizacao; }
	public void setDataAtualizacao(LocalDateTime dataAtualizacao) { this.dataAtualizacao = dataAtualizacao; }

	public User getUsuario() { return usuario; }
	public void setUsuario(User usuario) { this.usuario = usuario; }
}
