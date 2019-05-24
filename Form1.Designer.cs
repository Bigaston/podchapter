namespace PodChapter
{
    partial class PodChapter
    {
        /// <summary>
        /// Variable nécessaire au concepteur.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary>
        /// Nettoyage des ressources utilisées.
        /// </summary>
        /// <param name="disposing">true si les ressources managées doivent être supprimées ; sinon, false.</param>
        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Code généré par le Concepteur Windows Form

        /// <summary>
        /// Méthode requise pour la prise en charge du concepteur - ne modifiez pas
        /// le contenu de cette méthode avec l'éditeur de code.
        /// </summary>
        private void InitializeComponent()
        {
            this.components = new System.ComponentModel.Container();
            this.btnFolder = new System.Windows.Forms.Button();
            this.lblFolder = new System.Windows.Forms.Label();
            this.grpChapitres = new System.Windows.Forms.GroupBox();
            this.btnValide = new System.Windows.Forms.Button();
            this.btnAddChapter = new System.Windows.Forms.Button();
            this.pnlChapitres = new System.Windows.Forms.Panel();
            this.openFileDialog = new System.Windows.Forms.OpenFileDialog();
            this.errorProvider = new System.Windows.Forms.ErrorProvider(this.components);
            this.grpChapitres.SuspendLayout();
            ((System.ComponentModel.ISupportInitialize)(this.errorProvider)).BeginInit();
            this.SuspendLayout();
            // 
            // btnFolder
            // 
            this.btnFolder.Location = new System.Drawing.Point(95, 13);
            this.btnFolder.Margin = new System.Windows.Forms.Padding(4);
            this.btnFolder.Name = "btnFolder";
            this.btnFolder.Size = new System.Drawing.Size(234, 34);
            this.btnFolder.TabIndex = 0;
            this.btnFolder.Text = "Choisir votre fichier .MP3";
            this.btnFolder.UseVisualStyleBackColor = true;
            this.btnFolder.Click += new System.EventHandler(this.BtnFolder_Click);
            // 
            // lblFolder
            // 
            this.lblFolder.Location = new System.Drawing.Point(12, 51);
            this.lblFolder.Name = "lblFolder";
            this.lblFolder.Size = new System.Drawing.Size(406, 38);
            this.lblFolder.TabIndex = 1;
            this.lblFolder.Text = "Aucun fichier choisis";
            this.lblFolder.TextAlign = System.Drawing.ContentAlignment.TopCenter;
            // 
            // grpChapitres
            // 
            this.grpChapitres.Controls.Add(this.btnValide);
            this.grpChapitres.Controls.Add(this.btnAddChapter);
            this.grpChapitres.Controls.Add(this.pnlChapitres);
            this.grpChapitres.Location = new System.Drawing.Point(16, 92);
            this.grpChapitres.Name = "grpChapitres";
            this.grpChapitres.Size = new System.Drawing.Size(402, 304);
            this.grpChapitres.TabIndex = 2;
            this.grpChapitres.TabStop = false;
            this.grpChapitres.Text = "Chapitres";
            this.grpChapitres.Visible = false;
            // 
            // btnValide
            // 
            this.btnValide.Location = new System.Drawing.Point(79, 266);
            this.btnValide.Name = "btnValide";
            this.btnValide.Size = new System.Drawing.Size(234, 32);
            this.btnValide.TabIndex = 2;
            this.btnValide.Text = "Encoder";
            this.btnValide.UseVisualStyleBackColor = true;
            this.btnValide.Click += new System.EventHandler(this.BtnValide_Click);
            // 
            // btnAddChapter
            // 
            this.btnAddChapter.Location = new System.Drawing.Point(79, 227);
            this.btnAddChapter.Name = "btnAddChapter";
            this.btnAddChapter.Size = new System.Drawing.Size(234, 32);
            this.btnAddChapter.TabIndex = 1;
            this.btnAddChapter.Text = "Ajouter un chapitre";
            this.btnAddChapter.UseVisualStyleBackColor = true;
            this.btnAddChapter.Click += new System.EventHandler(this.BtnAddChapter_Click);
            // 
            // pnlChapitres
            // 
            this.pnlChapitres.AutoScroll = true;
            this.pnlChapitres.Location = new System.Drawing.Point(7, 27);
            this.pnlChapitres.Name = "pnlChapitres";
            this.pnlChapitres.Size = new System.Drawing.Size(389, 181);
            this.pnlChapitres.TabIndex = 0;
            // 
            // openFileDialog
            // 
            this.openFileDialog.FileName = "audio.mp3";
            this.openFileDialog.Filter = "Fichier audio (*.mp3)|*.mp3";
            // 
            // errorProvider
            // 
            this.errorProvider.ContainerControl = this;
            // 
            // PodChapter
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(9F, 19F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(430, 408);
            this.Controls.Add(this.grpChapitres);
            this.Controls.Add(this.lblFolder);
            this.Controls.Add(this.btnFolder);
            this.Font = new System.Drawing.Font("Lato", 12F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.Margin = new System.Windows.Forms.Padding(4);
            this.Name = "PodChapter";
            this.Text = "PodChapter";
            this.Load += new System.EventHandler(this.PodChapter_Load);
            this.grpChapitres.ResumeLayout(false);
            ((System.ComponentModel.ISupportInitialize)(this.errorProvider)).EndInit();
            this.ResumeLayout(false);

        }

        #endregion
        private System.Windows.Forms.Button btnFolder;
        private System.Windows.Forms.Label lblFolder;
        private System.Windows.Forms.GroupBox grpChapitres;
        private System.Windows.Forms.Panel pnlChapitres;
        private System.Windows.Forms.Button btnAddChapter;
        private System.Windows.Forms.OpenFileDialog openFileDialog;
        private System.Windows.Forms.ErrorProvider errorProvider;
        private System.Windows.Forms.Button btnValide;
    }
}

