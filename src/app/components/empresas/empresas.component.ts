import { Component, OnInit } from '@angular/core';
import { Empresa } from "../../models/empresa";
import { EmpresasService } from "../../services/empresas.service";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ModalDialogService } from "../../services/modal-dialog.service";

@Component({
  selector: 'app-empresas',
  templateUrl: './empresas.component.html',
  styleUrls: ['./empresas.component.css']
})
export class EmpresasComponent implements OnInit {
 Titulo = "Empresas";
 TituloAccionABMC = {
    A: "(Agregar)",
    L: "(Listado)"
  };
  AccionABMC = "L"; // inicialmente inicia en el listado de empresas (buscar con parametros)
  Mensajes = {
    SD: " No se encontraron registros...",
    RD: " Revisar los datos ingresados..."
  };

  Lista: Empresa[] = [];
  SinBusquedasRealizadas = true;

  Pagina = 1; // inicia pagina 1

  FormFiltro: FormGroup;
  FormReg: FormGroup;
  submitted = false;

  constructor(
    public formBuilder: FormBuilder,
    private empresasService: EmpresasService,
    private modalDialogService: ModalDialogService
  ) {}

  ngOnInit() {
    this.FormFiltro = this.formBuilder.group({
      RazonSocial: [""],
    });
    this.FormReg = this.formBuilder.group({
      IdEmpresa: [0],
      RazonSocial: [
        "",
        [Validators.required, Validators.minLength(1), Validators.maxLength(50)]
      ],
      CantidadEmpleados: [null, [Validators.required, Validators.pattern("[0-9]{1,7}")]],
      FechaFundacion: [
        "",
        [
          Validators.required,
          Validators.pattern(
            "(0[1-9]|[12][0-9]|3[01])[-/](0[1-9]|1[012])[-/](19|20)[0-9]{2}"
          )
        ]
      ],
    });

  }


  Agregar() {
    this.AccionABMC = "A";
    this.FormReg.reset({ });
    this.submitted = false;
    //this.FormReg.markAsPristine();
    this.FormReg.markAsUntouched();
  }

  // Buscar segun los filtros, establecidos en FormReg
  Buscar() {
    this.SinBusquedasRealizadas = false;
    this.empresasService.get().subscribe((res: any) => {
      this.Lista= res.Lista;
    });
  }


  // grabar tanto altas como modificaciones
  Grabar() {
    this.submitted = true;
    // verificar que los validadores esten OK
    if (this.FormReg.invalid) {
      return;
    }

    //hacemos una copia de los datos del formulario, para modificar la fecha y luego enviarlo al servidor
    const itemCopy = { ...this.FormReg.value };

    //convertir fecha de string dd/MM/yyyy a ISO para que la entienda webapi
    var arrFecha = itemCopy.FechaFundacion.substr(0, 10).split("/");
    if (arrFecha.length == 3)
      itemCopy.FechaFundacion = new Date(
        arrFecha[2],
        arrFecha[1] - 1,
        arrFecha[0]
      ).toISOString();

    // agregar post
    if (itemCopy.IdEmpresa == 0 || itemCopy.IdEmpresa == null) {
      itemCopy.IdEmpresa = 0;
      this.empresasService.post(itemCopy).subscribe((res: any) => {
        this.Volver();
        this.modalDialogService.Alert("Registro agregado correctamente.");
        this.Buscar();
      });
    } else {
      // modificar put
      this.empresasService
        .put(itemCopy.IdEmpresa, itemCopy)
        .subscribe((res: any) => {
          this.Volver();
          this.modalDialogService.Alert("Registro modificado correctamente.");
          this.Buscar();
        });
    }
  }


  // Volver desde Agregar/Modificar
  Volver() {
    this.AccionABMC = "L";
  }

  ImprimirListado() {
    this.modalDialogService.Alert("Sin desarrollar...");
  }

  
}