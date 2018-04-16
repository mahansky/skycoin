import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { WalletService } from '../../../../services/wallet.service';
import { DoubleButtonActive } from '../../../layout/double-button/double-button.component';
import { OnboardingDisclaimerComponent } from './onboarding-disclaimer/onboarding-disclaimer.component';
import { OnboardingSafeguardComponent } from './onboarding-safeguard/onboarding-safeguard.component';
import { MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-onboarding-create-wallet',
  templateUrl: './onboarding-create-wallet.component.html',
  styleUrls: ['./onboarding-create-wallet.component.scss'],
})
export class OnboardingCreateWalletComponent implements OnInit {
  showNewForm = true;
  form: FormGroup;
  doubleButtonActive = DoubleButtonActive.LeftButton;

  constructor(
    private dialog: MatDialog,
    public walletService: WalletService,
    private router: Router,
    private formBuilder: FormBuilder,
  ) {
    this.showDisclaimer();
  }

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.form = this.formBuilder.group({
        label: new FormControl('', Validators.compose([
          Validators.required, Validators.minLength(2),
        ])),
        seed: new FormControl('', Validators.compose([
          Validators.required, Validators.minLength(2),
        ])),
        confirm_seed: new FormControl('',
          Validators.compose(this.showNewForm ? [Validators.required, Validators.minLength(2)] : [])
        ),
      },
      this.showNewForm ? { validator: this.seedMatchValidator.bind(this) } : {},
    );

    if (this.showNewForm) {
      this.generateSeed();
    }
  }

  changeForm(newState) {
    this.showNewForm = newState === DoubleButtonActive.LeftButton;
    this.initForm();
  }

  showDisclaimer() {
    const config = new MatDialogConfig();
    config.width = '450px';
    config.disableClose = true;
    this.dialog.open(OnboardingDisclaimerComponent, config);
  }

  showSafe(): MatDialogRef {
    const config = new MatDialogConfig();
    config.width = '450px';
    return this.dialog.open(OnboardingSafeguardComponent, config);
  }

  createWallet() {
    this.showSafe().afterClosed().subscribe(result => {
      if (result) {
        this.walletService.create(this.form.value.label, this.form.value.seed, 100);
        this.router.navigate(['/wizard/encrypt']);
      }
    });
  }

  loadWallet() {
    this.walletService.create(this.form.value.label, this.form.value.seed, 100);
    this.router.navigate(['/wallets']);
  }

  generateSeed() {
    this.walletService.generateSeed().subscribe(seed => {
      this.form.get('seed').setValue(seed);
    });
  }

  private seedMatchValidator(g: FormGroup) {
    return g.get('seed').value === g.get('confirm_seed').value
      ? null : { mismatch: true };
  }

}